import { Router, Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Task } from "../entity/Task";
import { AuthRequest } from "../middleware/auth";
import { sendPushToTenant } from "./push";
import { uid } from "../utils";

const router = Router();

const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

const repo = () => AppDataSource.getRepository(Task);
const tid = (req: Request) => (req as AuthRequest).user!.tenantId;

router.get(
  "/",
  wrap(async (req, res) => {
    const tasks = await repo().find({
      where: { tenantId: tid(req) },
      order: { createdAt: "DESC" },
    });
    res.json(tasks);
  }),
);

router.post(
  "/",
  wrap(async (req, res) => {
    const {
      name,
      entityId,
      priority,
      assigneeIds,
      dueDate,
      repeat,
      repeatEvery,
      repeatFrequency,
      earlyReminderValue,
      earlyReminderUnit,
      suppressNotification,
    } = req.body as {
      name?: string;
      entityId?: string;
      priority?: string;
      assigneeIds?: string[];
      dueDate?: string;
      repeat?: string;
      repeatEvery?: number | string;
      repeatFrequency?: string;
      earlyReminderValue?: number | string;
      earlyReminderUnit?: string;
      suppressNotification?: boolean;
    };
    if (!name) return void res.status(400).json({ error: "name is required" });

    const task = repo().create({
      id: uid(),
      name,
      entityId: entityId || null,
      priority: priority || null,
      done: false,
      assigneeIds: assigneeIds?.length ? JSON.stringify(assigneeIds) : null,
      dueDate: dueDate || null,
      repeat: repeat || null,
      repeatEvery: repeatEvery ? parseInt(String(repeatEvery), 10) : null,
      repeatFrequency: repeatFrequency || null,
      earlyReminderValue: earlyReminderValue
        ? parseInt(String(earlyReminderValue), 10)
        : null,
      earlyReminderUnit: earlyReminderUnit || null,
      tenantId: tid(req),
    });
    await repo().save(task);

    // Creation notification — suppressed for auto-created recurring tasks
    if (!suppressNotification) {
      const { sub: creatorId, username } = (req as AuthRequest).user!;
      sendPushToTenant(
        task.tenantId,
        {
          title: task.name,
          body: `Added by ${username}`,
          taskId: task.id,
        },
        creatorId,
      ).catch((err) =>
        console.error("[push] creation notification failed:", err),
      );
    }

    res.status(201).json(task);
  }),
);

router.put(
  "/:id",
  wrap(async (req, res) => {
    const task = await repo().findOne({
      where: { id: req.params.id, tenantId: tid(req) },
    });
    if (!task) return void res.status(404).json({ error: "Not found" });

    const oldDueDate = task.dueDate;
    const oldEarlyValue = task.earlyReminderValue;
    const oldEarlyUnit = task.earlyReminderUnit;

    const fields = [
      "name",
      "entityId",
      "priority",
      "done",
      "dueDate",
      "repeat",
      "repeatEvery",
      "repeatFrequency",
      "earlyReminderValue",
      "earlyReminderUnit",
    ] as const;
    fields.forEach((f) => {
      if (req.body[f] !== undefined)
        (task as unknown as Record<string, unknown>)[f] = req.body[f];
    });
    if (req.body.assigneeIds !== undefined) {
      const ids = req.body.assigneeIds as string[];
      task.assigneeIds = ids?.length ? JSON.stringify(ids) : null;
    }

    // done toggled → set or clear completedAt
    const doneChanged =
      req.body.done !== undefined && req.body.done !== task.done;
    if (doneChanged) {
      task.completedAt = req.body.done ? new Date() : null;
      // Un-completing: reset notification state so reminders fire again
      if (!req.body.done) {
        task.reminderSentAt = null;
        task.earlyReminderSentAt = null;
        task.overdueCount = 0;
      }
    }

    // Due date changed → reset notification state so reminders fire for the new date
    const dueDateChanged =
      req.body.dueDate !== undefined && req.body.dueDate !== oldDueDate;
    if (dueDateChanged) {
      task.reminderSentAt = null;
      task.earlyReminderSentAt = null;
      // Don't blindly reset overdueCount to 0 — if the new due date is already in the past,
      // skip tiers that have already elapsed so only the next applicable tier fires.
      // Without this, editing a ~48h-old task triggers "1 day overdue" immediately followed
      // by "2 days overdue" minutes later.
      const newDue = req.body.dueDate
        ? new Date(
            (req.body.dueDate as string).includes("T")
              ? (req.body.dueDate as string)
              : (req.body.dueDate as string) + "T09:00:00",
          )
        : null;
      if (!newDue) {
        task.overdueCount = 0;
      } else {
        const OVERDUE_MS = [24 * 3600_000, 48 * 3600_000, 7 * 24 * 3600_000];
        const nowMs = Date.now();
        let skipCount = 0;
        for (const ms of OVERDUE_MS) {
          if (nowMs >= newDue.getTime() + ms) skipCount++;
          else break;
        }
        task.overdueCount = skipCount;
      }
    }

    // Early reminder config changed (without due date change) → reset early reminder only
    if (!dueDateChanged) {
      const earlyChanged =
        (req.body.earlyReminderValue !== undefined &&
          req.body.earlyReminderValue !== oldEarlyValue) ||
        (req.body.earlyReminderUnit !== undefined &&
          req.body.earlyReminderUnit !== oldEarlyUnit);
      if (earlyChanged) task.earlyReminderSentAt = null;
    }

    await repo().save(task);
    res.json(task);
  }),
);

router.delete(
  "/:id",
  wrap(async (req, res) => {
    await repo().delete({ id: req.params.id, tenantId: tid(req) });
    res.status(204).end();
  }),
);

export default router;
