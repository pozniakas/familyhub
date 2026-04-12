import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Task } from '../entity/Task';
import { AuthRequest } from '../middleware/auth';
import { uid } from '../utils';

const router = Router();

const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

const repo = () => AppDataSource.getRepository(Task);
const tid = (req: Request) => (req as AuthRequest).user!.tenantId;

router.get(
  '/',
  wrap(async (req, res) => {
    const tasks = await repo().find({ where: { tenantId: tid(req) }, order: { createdAt: 'DESC' } });
    res.json(tasks);
  }),
);

router.post(
  '/',
  wrap(async (req, res) => {
    const { name, entityId, priority, assigneeIds, dueDate, repeat, repeatEvery, repeatFrequency } =
      req.body as {
        name?: string;
        entityId?: string;
        priority?: string;
        assigneeIds?: string[];
        dueDate?: string;
        repeat?: string;
        repeatEvery?: number | string;
        repeatFrequency?: string;
      };
    if (!name) return void res.status(400).json({ error: 'name is required' });

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
      tenantId: tid(req),
    });
    await repo().save(task);
    res.status(201).json(task);
  }),
);

router.put(
  '/:id',
  wrap(async (req, res) => {
    const task = await repo().findOne({ where: { id: req.params.id, tenantId: tid(req) } });
    if (!task) return void res.status(404).json({ error: 'Not found' });

    const fields = ['name', 'entityId', 'priority', 'done', 'dueDate', 'repeat', 'repeatEvery', 'repeatFrequency'] as const;
    fields.forEach((f) => {
      if (req.body[f] !== undefined) (task as unknown as Record<string, unknown>)[f] = req.body[f];
    });
    if (req.body.assigneeIds !== undefined) {
      const ids = req.body.assigneeIds as string[];
      task.assigneeIds = ids?.length ? JSON.stringify(ids) : null;
    }
    await repo().save(task);
    res.json(task);
  }),
);

router.delete(
  '/:id',
  wrap(async (req, res) => {
    await repo().delete({ id: req.params.id, tenantId: tid(req) });
    res.status(204).end();
  }),
);

export default router;
