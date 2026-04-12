import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { FamilyEntity } from '../entity/FamilyEntity';
import { Section } from '../entity/Section';
import { Item } from '../entity/Item';
import { AuthRequest } from '../middleware/auth';
import { uid } from '../utils';

const router = Router();

const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

const entityRepo = () => AppDataSource.getRepository(FamilyEntity);
const sectionRepo = () => AppDataSource.getRepository(Section);
const itemRepo = () => AppDataSource.getRepository(Item);

const tenantId = (req: Request) => (req as AuthRequest).user!.tenantId;

router.get(
  '/',
  wrap(async (req, res) => {
    const entities = await entityRepo().find({
      where: { tenantId: tenantId(req) },
      relations: ['sections'],
      order: { sections: { sortOrder: 'ASC' } },
    });
    res.json(entities);
  }),
);

router.post(
  '/',
  wrap(async (req, res) => {
    const { name, emoji } = req.body as { name?: string; emoji?: string };
    if (!name) return void res.status(400).json({ error: 'name is required' });
    const entity = entityRepo().create({ id: uid(), name, emoji: emoji || '📁', tenantId: tenantId(req) });
    await entityRepo().save(entity);
    entity.sections = [];
    res.status(201).json(entity);
  }),
);

router.put(
  '/:id',
  wrap(async (req, res) => {
    const entity = await entityRepo().findOne({ where: { id: req.params.id, tenantId: tenantId(req) } });
    if (!entity) return void res.status(404).json({ error: 'Not found' });
    const { name, emoji } = req.body as { name?: string; emoji?: string };
    if (name !== undefined) entity.name = name;
    if (emoji !== undefined) entity.emoji = emoji;
    await entityRepo().save(entity);
    res.json(entity);
  }),
);

router.delete(
  '/:id',
  wrap(async (req, res) => {
    const entity = await entityRepo().findOne({ where: { id: req.params.id, tenantId: tenantId(req) } });
    if (!entity) return void res.status(404).json({ error: 'Not found' });
    await itemRepo().delete({ entityId: req.params.id });
    await entityRepo().delete(req.params.id);
    res.status(204).end();
  }),
);

// ── Sections ────────────────────────────────────────────────────────────────

router.put(
  '/:id/sections/reorder',
  wrap(async (req, res) => {
    const { ids } = req.body as { ids: string[] };
    await Promise.all(ids.map((id, index) => sectionRepo().update(id, { sortOrder: index })));
    res.json({ ok: true });
  }),
);

router.post(
  '/:id/sections',
  wrap(async (req, res) => {
    const entity = await entityRepo().findOne({ where: { id: req.params.id, tenantId: tenantId(req) } });
    if (!entity) return void res.status(404).json({ error: 'Entity not found' });
    const { name } = req.body as { name?: string };
    if (!name) return void res.status(400).json({ error: 'name is required' });

    const { max } = (await sectionRepo()
      .createQueryBuilder('s')
      .select('MAX(s.sortOrder)', 'max')
      .where('s.entityId = :id', { id: req.params.id })
      .getRawOne()) as { max: number | null };

    const section = sectionRepo().create({
      id: uid(),
      entityId: req.params.id,
      name,
      sortOrder: (max ?? -1) + 1,
    });
    await sectionRepo().save(section);
    res.status(201).json(section);
  }),
);

router.put(
  '/:id/sections/:sid',
  wrap(async (req, res) => {
    const section = await sectionRepo().findOne({
      where: { id: req.params.sid, entityId: req.params.id },
    });
    if (!section) return void res.status(404).json({ error: 'Section not found' });
    if (req.body.name !== undefined) section.name = req.body.name as string;
    await sectionRepo().save(section);
    res.json(section);
  }),
);

router.delete(
  '/:id/sections/:sid',
  wrap(async (req, res) => {
    await itemRepo().delete({ entityId: req.params.id, sectionId: req.params.sid });
    await sectionRepo().delete({ id: req.params.sid, entityId: req.params.id });
    res.status(204).end();
  }),
);

export default router;
