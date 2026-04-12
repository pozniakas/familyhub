import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { PushSubscription } from '../entity/PushSubscription';
import { adminMiddleware } from '../middleware/auth';
import { uid } from '../utils';
import { sendPushToUser } from './push';

const router = Router();

const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

const userRepo = () => AppDataSource.getRepository(User);
const subRepo  = () => AppDataSource.getRepository(PushSubscription);

// All routes in this file require the admin password header
router.use(adminMiddleware);

/** GET /api/admin/users — list all users (no password hashes), with push subscription flag */
router.get(
  '/users',
  wrap(async (_req, res) => {
    const users = await userRepo().find({
      select: ['id', 'username', 'createdAt'],
      order: { createdAt: 'ASC' },
    });
    const subs = await subRepo().find({ select: ['userId'] });
    const subscribedIds = new Set(subs.map((s) => s.userId));
    const result = users.map((u) => ({ ...u, hasPush: subscribedIds.has(u.id) }));
    res.json(result);
  }),
);

/** POST /api/admin/users — create a user */
router.post(
  '/users',
  wrap(async (req, res) => {
    const { username, password } = req.body as { username?: string; password?: string };
    if (!username || !password) {
      return void res.status(400).json({ error: 'username and password are required' });
    }
    const existing = await userRepo().findOne({ where: { username } });
    if (existing) return void res.status(409).json({ error: 'Username already taken' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = userRepo().create({ id: uid(), username, passwordHash });
    await userRepo().save(user);
    res.status(201).json({ id: user.id, username: user.username, createdAt: user.createdAt });
  }),
);

/** PUT /api/admin/users/:id/password — change a user's password */
router.put(
  '/users/:id/password',
  wrap(async (req, res) => {
    const { password } = req.body as { password?: string };
    if (!password) return void res.status(400).json({ error: 'password is required' });
    const user = await userRepo().findOne({ where: { id: req.params.id } });
    if (!user) return void res.status(404).json({ error: 'User not found' });
    user.passwordHash = await bcrypt.hash(password, 10);
    await userRepo().save(user);
    res.json({ ok: true });
  }),
);

/** DELETE /api/admin/users/:id — delete a user */
router.delete(
  '/users/:id',
  wrap(async (req, res) => {
    await userRepo().delete(req.params.id);
    res.status(204).end();
  }),
);

/** POST /api/admin/push-test/:id — send a test push notification to a user */
router.post(
  '/push-test/:id',
  wrap(async (req, res) => {
    const user = await userRepo().findOne({ where: { id: req.params.id } });
    if (!user) return void res.status(404).json({ error: 'User not found' });
    const result = await sendPushToUser(user.id, {
      title: 'FamilyHub',
      body: `Test notification for ${user.username}`,
    });
    res.json(result);
  }),
);

export default router;
