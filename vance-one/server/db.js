import mongoose from 'mongoose';

const URL = process.env.MONGO_URL || 'mongodb://localhost:27017/vanceone';

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Todo = mongoose.model('Todo', todoSchema);

export const connectDB = async () => {
  try {
    await mongoose.connect(URL);
    console.log('Connected to MongoDB:', URL);
  } catch (err) {
    console.error('MongoDB connection error', err);
    process.exit(1);
  }
};
