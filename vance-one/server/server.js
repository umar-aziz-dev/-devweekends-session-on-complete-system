import express from 'express';
import cors from 'cors';
import { connectDB, Todo } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Vance One API'));

app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch todos' });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const title = req.body?.title?.trim();
    if (!title) return res.status(400).json({ message: 'Title required' });
    const todo = await Todo.create({ title });
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create todo' });
  }
});

app.patch('/api/todos/:id', async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body.title === 'string') updates.title = req.body.title.trim();
    if (typeof req.body.completed === 'boolean') updates.completed = req.body.completed;
    const todo = await Todo.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!todo) return res.status(404).json({ message: 'Not found' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const deleted = await Todo.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await connectDB();
  console.log('Server listening on', PORT);
});
