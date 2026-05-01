//  Not production ready 

import express from 'express';
import cors from "cors"
import { connectDB, Todo } from './db.js';

const app = express();
app.use(cors(
    {
        origin: "*"
    }
));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World! from server');
});

app.get('/api/todos', async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch todos' });
    }
});

app.post('/api/todos', async (req, res) => {
    try {
        const title = req.body?.title?.trim();

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const todo = await Todo.create({ title });
        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create todo' });
    }
});

app.patch('/api/todos/:id', async (req, res) => {
    try {
        const updates = {};

        if (typeof req.body?.title === 'string') {
            const title = req.body.title.trim();
            if (!title) {
                return res.status(400).json({ message: 'Title cannot be empty' });
            }
            updates.title = title;
        }

        if (typeof req.body?.completed === 'boolean') {
            updates.completed = req.body.completed;
        }

        const todo = await Todo.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        res.json(todo);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update todo' });
    }
});

app.delete('/api/todos/:id', async (req, res) => {
    try {
        const deleted = await Todo.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete todo' });
    }
});


app.listen(3000, () => {
    connectDB();
    console.log('Server is running on port 3000');
});