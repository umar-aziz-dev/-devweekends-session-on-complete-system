import mongoose from "mongoose";

const URL = "mongodb://localhost:27017/sessions";

const todoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Todo = mongoose.model("Todo", todoSchema);

export  const connectDB = ()=>{
    mongoose.connect(URL).then(()=>{
        console.log("Connected to MongoDB");
    }).catch((err)=>{
        console.error("Error connecting to MongoDB:", err);
    });
}

