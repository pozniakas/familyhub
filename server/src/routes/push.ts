import { Router, Request, Response, NextFunction } from 'express';
import webpush from 'web-push';
import { AppDataSource } from '../data-source';
import { PushSubscription } from '../entity/PushSubscription';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { uid } from '../utils';

const router = Router();

const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

const subRepo = () => AppDataSource.getRepository(PushSubscription);

/** GET /api/push/vapid-public-key — return VAPID public key for the client */
router.get('/vapid-public-key', (_req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY || '' });
});

/** POST /api/push/subscribe — save a push subscription for the logged-in user */
router.post(
  '/subscribe',
  authMiddleware,
  wrap(async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user!;
    const { endpoint, keys } = req.body as { endpoint?: string; keys?: { p256dh: string; auth: string } };
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return void res.status(400).json({ error: 'Invalid subscription object' });
    }

    // Upsert: replace any existing sub for this user+endpoint
    let sub = await subRepo().findOne({ where: { userId: user.sub, endpoint } });
    if (!sub) {
      sub = subRepo().create({ id: uid(), userId: user.sub });
    }
    sub.endpoint = endpoint;
    sub.keys = JSON.stringify(keys);
    await subRepo().save(sub);
    res.status(201).json({ ok: true });
  }),
);

/** DELETE /api/push/subscribe — remove push subscription */
router.delete(
  '/subscribe',
  authMiddleware,
  wrap(async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user!;
    const { endpoint } = req.body as { endpoint?: string };
    if (endpoint) {
      await subRepo().delete({ userId: user.sub, endpoint });
    } else {
      // Remove all subs for this user
      await subRepo().delete({ userId: user.sub });
    }
    res.status(204).end();
  }),
);

/**
 * sendPushToUser — shared helper used by admin routes too.
 * Returns the number of subscriptions notified.
 */
export async function sendPushToUser(
  userId: string,
  payload: object,
): Promise<{ sent: number; errors: string[] }> {
  const subs = await subRepo().find({ where: { userId } });
  let sent = 0;
  const errors: string[] = [];
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: JSON.parse(sub.keys) },
        JSON.stringify(payload),
      );
      sent++;
    } catch (err: unknown) {
      const e = err as { statusCode?: number; body?: string; message?: string };
      const msg = `status=${e.statusCode} body=${e.body ?? e.message ?? String(err)}`;
      console.error(`[push] sendNotification failed for sub ${sub.id}: ${msg}`);
      errors.push(msg);
      // 410 Gone / 404 = subscription expired/unsubscribed — clean it up
      if (e.statusCode === 410 || e.statusCode === 404) {
        await subRepo().delete(sub.id);
      }
    }
  }
  return { sent, errors };
}

export default router;
