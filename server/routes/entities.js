const router = require('express').Router();
const db     = require('../db');
const { uid } = require('../utils');

// GET all entities
router.get('/', (req, res) => {
  res.json(db.read().entities);
});

// POST create entity
router.post('/', (req, res) => {
  const { name, emoji } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const data   = db.read();
  const entity = { id: uid(), name, emoji: emoji || '📁', sections: [] };
  data.entities.push(entity);
  db.write(data);
  res.status(201).json(entity);
});

// PUT update entity
router.put('/:id', (req, res) => {
  const data   = db.read();
  const entity = data.entities.find(e => e.id === req.params.id);
  if (!entity) return res.status(404).json({ error: 'Not found' });
  const { name, emoji } = req.body;
  if (name  !== undefined) entity.name  = name;
  if (emoji !== undefined) entity.emoji = emoji;
  db.write(data);
  res.json(entity);
});

// DELETE entity — also removes its items; tasks keep their entityId (handled gracefully in UI)
router.delete('/:id', (req, res) => {
  const data = db.read();
  data.items    = data.items.filter(i => i.entityId !== req.params.id);
  data.entities = data.entities.filter(e => e.id    !== req.params.id);
  db.write(data);
  res.status(204).end();
});

// ── Sections ──────────────────────────────────────────────────────────────────

// POST add section to entity
router.post('/:id/sections', (req, res) => {
  const data   = db.read();
  const entity = data.entities.find(e => e.id === req.params.id);
  if (!entity) return res.status(404).json({ error: 'Entity not found' });
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const section = { id: uid(), name };
  entity.sections.push(section);
  db.write(data);
  res.status(201).json(section);
});

// PUT reorder sections
router.put('/:id/sections/reorder', (req, res) => {
  const data   = db.read();
  const entity = data.entities.find(e => e.id === req.params.id);
  if (!entity) return res.status(404).json({ error: 'Entity not found' });
  const { ids } = req.body;
  entity.sections = ids.map(id => entity.sections.find(s => s.id === id)).filter(Boolean);
  db.write(data);
  res.json({ ok: true });
});

// PUT update section
router.put('/:id/sections/:sid', (req, res) => {
  const data    = db.read();
  const entity  = data.entities.find(e => e.id === req.params.id);
  if (!entity)  return res.status(404).json({ error: 'Entity not found' });
  const section = entity.sections.find(s => s.id === req.params.sid);
  if (!section) return res.status(404).json({ error: 'Section not found' });
  if (req.body.name !== undefined) section.name = req.body.name;
  db.write(data);
  res.json(section);
});

// DELETE section — also removes its items
router.delete('/:id/sections/:sid', (req, res) => {
  const data   = db.read();
  const entity = data.entities.find(e => e.id === req.params.id);
  if (!entity) return res.status(404).json({ error: 'Entity not found' });
  entity.sections = entity.sections.filter(s => s.id !== req.params.sid);
  data.items = data.items.filter(
    i => !(i.entityId === req.params.id && i.sectionId === req.params.sid)
  );
  db.write(data);
  res.status(204).end();
});

module.exports = router;
