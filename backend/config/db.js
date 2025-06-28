import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://lakshmipathyr2k6:taskmanager2025@cluster0.4d39hdv.mongodb.net/TaskManager')
    .then(() => {
        console.log("MongoDB connected successfully");
    }
    )

}