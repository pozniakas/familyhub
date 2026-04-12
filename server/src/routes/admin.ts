import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { Tenant } from '../entity/Tenant';
import { FamilyEntity } from '../entity/FamilyEntity';
import { Task } from '../entity/Task';
import { PushSubscription } from '../entity/PushSubscription';
import { adminMiddleware } from '../middleware/auth';
import { uid } from '../utils';
import { sendPushToUser } from './push';

const router = Router();

const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

const userRepo   = () => AppDataSource.getRepository(User);
const tenantRepo = () => AppDataSource.getRepository(Tenant);
const subRepo    = () => AppDataSource.getRepository(PushSubscription);

router.use(adminMiddleware);

// ── Tenants ────────────────────────────────────────────────────────────────────

/** GET /api/admin/tenants — list all tenants with their users and push status */
router.get(
  '/tenants',
  wrap(async (_req, res) => {
    const [tenants, users, subs] = await Promise.all([
      tenantRepo().find({ order: { createdAt: 'ASC' } }),
      userRepo().find({ select: ['id', 'username', 'createdAt', 'tenantId'], order: { createdAt: 'ASC' } }),
      subRepo().find({ select: ['userId'] }),
    ]);
    const subscribedIds = new Set(subs.map((s) => s.userId));
    const tenantsWithUsers = tenants.map((t) => ({
      ...t,
      users: users
        .filter((u) => u.tenantId === t.id)
        .map((u) => ({ ...u, hasPush: subscribedIds.has(u.id) })),
    }));
    res.json(tenantsWithUsers);
  }),
);

/** POST /api/admin/tenants — create a tenant */
router.post(
  '/tenants',
  wrap(async (req, res) => {
    const { name } = req.body as { name?: string };
    if (!name) return void res.status(400).json({ error: 'name is required' });
    const existing = await tenantRepo().findOne({ where: { name } });
    if (existing) return void res.status(409).json({ error: 'A tenant with this name already exists' });
    const tenant = tenantRepo().create({ id: uid(), name });
    await tenantRepo().save(tenant);
    res.status(201).json({ ...tenant, users: [] });
  }),
);

/** PUT /api/admin/tenants/:id — rename a tenant */
router.put(
  '/tenants/:id',
  wrap(async (req, res) => {
    const { name } = req.body as { name?: string };
    if (!name) return void res.status(400).json({ error: 'name is required' });
    const tenant = await tenantRepo().findOne({ where: { id: req.params.id } });
    if (!tenant) return void res.status(404).json({ error: 'Tenant not found' });
    tenant.name = name;
    await tenantRepo().save(tenant);
    res.json({ ok: true });
  }),
);

/** DELETE /api/admin/tenants/:id — delete tenant and all its data */
router.delete(
  '/tenants/:id',
  wrap(async (req, res) => {
    const { id } = req.params;
    // Delete in dependency order: tasks, entities, push_subscriptions via users cascade, users, tenant
    await AppDataSource.getRepository(Task).delete({ tenantId: id });
    await AppDataSource.getRepository(FamilyEntity).delete({ tenantId: id });
    // Users cascade-delete their push subscriptions
    await userRepo().delete({ tenantId: id });
    await tenantRepo().delete(id);
    res.status(204).end();
  }),
);

// ── Users ──────────────────────────────────────────────────────────────────────

/** GET /api/admin/users — list all users with push status (legacy, kept for compatibility) */
router.get(
  '/users',
  wrap(async (_req, res) => {
    const [users, subs] = await Promise.all([
      userRepo().find({ select: ['id', 'username', 'createdAt', 'tenantId'], order: { createdAt: 'ASC' } }),
      subRepo().find({ select: ['userId'] }),
    ]);
    const subscribedIds = new Set(subs.map((s) => s.userId));
    res.json(users.map((u) => ({ ...u, hasPush: subscribedIds.has(u.id) })));
  }),
);

/** POST /api/admin/users — create a user (tenantId required in body) */
router.post(
  '/users',
  wrap(async (req, res) => {
    const { username, password, tenantId } = req.body as {
      username?: string;
      password?: string;
      tenantId?: string;
    };
    if (!username || !password) {
      return void res.status(400).json({ error: 'username and password are required' });
    }
    if (!tenantId) {
      return void res.status(400).json({ error: 'tenantId is required' });
    }
    const tenant = await tenantRepo().findOne({ where: { id: tenantId } });
    if (!tenant) return void res.status(404).json({ error: 'Tenant not found' });

    const existing = await userRepo().findOne({ where: { username } });
    if (existing) return void res.status(409).json({ error: 'Username already taken' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = userRepo().create({ id: uid(), username, passwordHash, tenantId });
    await userRepo().save(user);
    res.status(201).json({ id: user.id, username: user.username, createdAt: user.createdAt, tenantId: user.tenantId, hasPush: false });
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
