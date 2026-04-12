import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Item } from '../entity/Item';
import { uid } from '../utils';

const router = Router();

const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

const repo = () => AppDataSource.getRepository(Item);

router.get(
  '/',
  wrap(async (_req, res) => {
    const items = await repo().find({ order: { sortOrder: 'ASC' } });
    res.json(items);
  }),
);

router.post(
  '/',
  wrap(async (req, res) => {
    const { entityId, sectionId, name, status, notes } = req.body as {
      entityId?: string;
      sectionId?: string;
      name?: string;
      status?: string;
      notes?: string;
    };
    if (!entityId || !sectionId || !name) {
      return void res.status(400).json({ error: 'entityId, sectionId and name are required' });
    }

    const { max } = (await repo()
      .createQueryBuilder('i')
      .select('MAX(i.sortOrder)', 'max')
      .where('i.entityId = :entityId AND i.sectionId = :sectionId', { entityId, sectionId })
      .getRawOne()) as { max: number | null };

    const item = repo().create({
      id: uid(),
      entityId,
      sectionId,
      name,
      status: status || 'ok',
      notes: notes || '',
      sortOrder: (max ?? -1) + 1,
    });
    await repo().save(item);
    res.status(201).json(item);
  }),
);

// NOTE: /reorder must be registered before /:id
router.put(
  '/reorder',
  wrap(async (req, res) => {
    const { ids } = req.body as { entityId: string; sectionId: string; ids: string[] };
    await Promise.all(ids.map((id, index) => repo().update(id, { sortOrder: index })));
    res.json({ ok: true });
  }),
);

router.put(
  '/:id',
  wrap(async (req, res) => {
    const item = await repo().findOne({ where: { id: req.params.id } });
    if (!item) return void res.status(404).json({ error: 'Not found' });
    const allowed = ['name', 'status', 'notes'] as const;
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) item[f] = req.body[f] as string;
    });
    await repo().save(item);
    res.json(item);
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
