const router = require('express').Router();
const db     = require('../db');
const { uid } = require('../utils');

router.get('/', (req, res) => {
  res.json(db.read().tasks);
});

router.post('/', (req, res) => {
  const { name, entityId, priority, assignedTo, dueDate, repeat, repeatEvery, repeatFrequency } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const data = db.read();
  const task = {
    id: uid(),
    name,
    entityId: entityId || null,
    priority: priority || null,
    done: false,
    assignedTo: assignedTo || '',
    dueDate: dueDate || null,
    repeat: repeat || null,
    repeatEvery: repeatEvery ? parseInt(repeatEvery, 10) : null,
    repeatFrequency: repeatFrequency || null,
  };
  data.tasks.unshift(task);
  db.write(data);
  res.status(201).json(task);
});

router.put('/:id', (req, res) => {
  const data = db.read();
  const task = data.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Not found' });
  const fields = ['name', 'entityId', 'priority', 'done', 'assignedTo', 'dueDate', 'repeat', 'repeatEvery', 'repeatFrequency'];
  fields.forEach(f => { if (req.body[f] !== undefined) task[f] = req.body[f]; });
  db.write(data);
  res.json(task);
});

router.delete('/:id', (req, res) => {
  const data = db.read();
  data.tasks = data.tasks.filter(t => t.id !== req.params.id);
  db.write(data);
  res.status(204).end();
});

module.exports = router;
