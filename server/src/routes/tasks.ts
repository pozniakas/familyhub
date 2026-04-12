import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Task } from '../entity/Task';
import { uid } from '../utils';

const router = Router();

const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

const repo = () => AppDataSource.getRepository(Task);

router.get(
  '/',
  wrap(async (_req, res) => {
    const tasks = await repo().find({ order: { createdAt: 'DESC' } });
    res.json(tasks);
  }),
);

router.post(
  '/',
  wrap(async (req, res) => {
    const { name, entityId, priority, assignedTo, dueDate, repeat, repeatEvery, repeatFrequency } =
      req.body as {
        name?: string;
        entityId?: string;
        priority?: string;
        assignedTo?: string;
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
      assignedTo: assignedTo || '',
      dueDate: dueDate || null,
      repeat: repeat || null,
      repeatEvery: repeatEvery ? parseInt(String(repeatEvery), 10) : null,
      repeatFrequency: repeatFrequency || null,
    });
    await repo().save(task);
    res.status(201).json(task);
  }),
);

router.put(
  '/:id',
  wrap(async (req, res) => {
    const task = await repo().findOne({ where: { id: req.params.id } });
    if (!task) return void res.status(404).json({ error: 'Not found' });

    const fields = [
      'name',
      'entityId',
      'priority',
      'done',
      'assignedTo',
      'dueDate',
      'repeat',
      'repeatEvery',
      'repeatFrequency',
    ] as const;
    fields.forEach((f) => {
      if (req.body[f] !== undefined) (task as unknown as Record<string, unknown>)[f] = req.body[f];
    });
    await repo().save(task);
    res.json(task);
  }),
);

router.delete(
  '/:id',
  wrap(async (req, res) => {
    await repo().delete(req.params.id);
    res.status(204).end();
  }),
);

export default router;
