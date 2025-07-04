import User from '../model/userModel.js';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const TOKEN_EXPIRES = '24h';

const createToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
}


// Register a new user
export async function registerUser(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (password.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    try{
        if (await User.findOne({ email })) {
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashed
        });
        const token = createToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }});
        }

    catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: 'Server error' });
        }   
    
}

// Login user

export async function loginUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = createToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }


}

// Get user profile
export async function getCurrentUser(req, res) {
    try{
        const user = await User.findById(req.user.id).select("name email");
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// Update user profile

export async function updateUserProfile(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    try {
        const exists = await User.findOne({email, _id : {$ne: req.user.id}});
        if (exists) {
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }
        const user = await User.findByIdAndUpdate(req.user.id,
            { name, email },
            { new: true, runValidators: true, select: 'name email' }
        );
        res.json({ success: true, user });
    } 
    
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }

}

//change password
export async function updatePassword(req, res) {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
    }

    try {
        const user = await User.findById(req.user.id).select('password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
