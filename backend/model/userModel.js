import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please enter your name"],
    },

    email:{
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
    },

    password:{
        type: String,
        required: [true, "Please enter your password"],
    }
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
    
