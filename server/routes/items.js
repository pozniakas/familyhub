const router = require('express').Router();
const db     = require('../db');
const { uid } = require('../utils');

router.get('/', (req, res) => {
  res.json(db.read().items);
});

router.post('/', (req, res) => {
  const { entityId, sectionId, name, status, notes } = req.body;
  if (!entityId || !sectionId || !name) {
    return res.status(400).json({ error: 'entityId, sectionId and name are required' });
  }
  const data = db.read();
  const item = { id: uid(), entityId, sectionId, name, status: status || 'ok', notes: notes || '' };
  data.items.push(item);
  db.write(data);
  res.status(201).json(item);
});

// PUT reorder items within a section
router.put('/reorder', (req, res) => {
  const { entityId, sectionId, ids } = req.body;
  const data = db.read();
  const others   = data.items.filter(i => !(i.entityId === entityId && i.sectionId === sectionId));
  const reordered = ids.map(id => data.items.find(i => i.id === id)).filter(Boolean);
  data.items = [...others, ...reordered];
  db.write(data);
  res.json({ ok: true });
});

router.put('/:id', (req, res) => {
  const data = db.read();
  const item = data.items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  const fields = ['name', 'status', 'notes'];
  fields.forEach(f => { if (req.body[f] !== undefined) item[f] = req.body[f]; });
  db.write(data);
  res.json(item);
});

router.delete('/:id', (req, res) => {
  const data = db.read();
  data.items = data.items.filter(i => i.id !== req.params.id);
  db.write(data);
  res.status(204).end();
});

module.exports = router;
