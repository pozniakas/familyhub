import { AppDataSource } from './data-source';
import { Task } from './entity/Task';
import { sendPushToTenant } from './routes/push';

/**
 * Parse a stored dueDate string into a JS Date in local server time.
 * "2026-04-15T14:30" → local 14:30
 * "2026-04-15"       → local 09:00 (morning notification for all-day tasks)
 *
 * Set TZ=Europe/Vilnius (or your timezone) in .env / docker-compose so that
 * "local server time" matches the family's timezone.
 */
function parseDue(dueDate: string): Date {
  return new Date(dueDate.includes('T') ? dueDate : dueDate + 'T09:00:00');
}

/**
 * Subtract an early-reminder offset from a due date.
 * Bug #5 fix: pin to day 1 before changing month to avoid end-of-month overflow
 * (e.g. March 31 − 1 month must land on Feb 28/29, not March 2/3).
 */
function calcEarlyTime(dueTime: Date, value: number, unit: string): Date {
  const d = new Date(dueTime);
  switch (unit) {
    case 'minutes': d.setMinutes(d.getMinutes() - value); break;
    case 'hours':   d.setHours(d.getHours() - value);    break;
    case 'days':    d.setDate(d.getDate() - value);       break;
    case 'weeks':   d.setDate(d.getDate() - value * 7);   break;
    case 'months': {
      const day = d.getDate();
      d.setDate(1);
      d.setMonth(d.getMonth() - value);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(day, lastDay));
      break;
    }
  }
  return d;
}

function unitLabel(value: number, unit: string): string {
  const s = value !== 1 ? 's' : '';
  switch (unit) {
    case 'minutes': return `minute${s}`;
    case 'hours':   return `hour${s}`;
    case 'days':    return `day${s}`;
    case 'weeks':   return `week${s}`;
    case 'months':  return `month${s}`;
    default:        return unit;
  }
}

const OVERDUE_TIERS = [
  { ms: 24 * 3600_000,     body: '1 day overdue' },
  { ms: 48 * 3600_000,     body: '2 days overdue' },
  { ms: 7 * 24 * 3600_000, body: 'Over a week overdue · last reminder' },
];

let running = false;

async function tick(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const repo = AppDataSource.getRepository(Task);
    const now = new Date();

    const tasks = await repo.find({ where: { done: false } });

    for (const task of tasks) {
      if (!task.dueDate) continue;

      const dueTime = parseDue(task.dueDate);

      // ── Early reminder ─────────────────────────────────────────────────────
      // Bug #1 fix: only fire while the task is not yet due (now < dueTime).
      // If the server was down over the due time, skip the early reminder —
      // the "Due now" notification is more relevant at that point.
      if (task.earlyReminderValue && task.earlyReminderUnit && !task.earlyReminderSentAt && now < dueTime) {
        const earlyTime = calcEarlyTime(dueTime, task.earlyReminderValue, task.earlyReminderUnit);
        if (now >= earlyTime) {
          await sendPushToTenant(task.tenantId, {
            title: task.name,
            body: `Due in ${task.earlyReminderValue} ${unitLabel(task.earlyReminderValue, task.earlyReminderUnit)}`,
          });
          await repo.update(task.id, { earlyReminderSentAt: now });
        }
      }

      // ── Due-time notification ──────────────────────────────────────────────
      if (!task.reminderSentAt && now >= dueTime) {
        await sendPushToTenant(task.tenantId, {
          title: task.name,
          body: 'Due now',
        });
        await repo.update(task.id, { reminderSentAt: now });
        // NOTE: task.reminderSentAt is intentionally NOT updated in memory here.
        // This means overdue checks below will not fire in the same tick —
        // they will only run on the next tick once the DB value is reloaded.
        // This prevents sending "Due now" + "1 day overdue" simultaneously
        // when the server catches up after downtime (Bug #3 fix).
      }

      // ── Overdue reminders (max 3, spaced at 24 h / 48 h / 7 days) ─────────
      // Bug #3 fix: require reminderSentAt to be set (loaded from DB) before
      // any overdue tier fires. Combined with the in-memory non-update above,
      // this guarantees at most one notification per task per tick.
      const count = task.overdueCount ?? 0;
      if (task.reminderSentAt && count < OVERDUE_TIERS.length) {
        const tier = OVERDUE_TIERS[count];
        if (now.getTime() >= dueTime.getTime() + tier.ms) {
          await sendPushToTenant(task.tenantId, {
            title: task.name,
            body: tier.body,
          });
          await repo.update(task.id, { overdueCount: count + 1 });
        }
      }
    }
  } catch (err) {
    console.error('[scheduler] tick error:', err);
  } finally {
    running = false;
  }
}

export function startScheduler(): void {
  setTimeout(() => tick(), 10_000);          // first run 10 s after startup
  setInterval(() => tick(), 60_000);         // then every 60 s
  console.log('[scheduler] started (60 s interval)');
}
