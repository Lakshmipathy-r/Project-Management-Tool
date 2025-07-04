import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export default async function authMiddleware(req, res, next) {
    //grab the bearer token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized, token missing' });
    }

    const token = authHeader.split(' ')[1];
    // verify & attach the user object
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized, user not found' });
        }

        req.user = user; // Attach user to request object
        next();
    }
    catch (error) {
        console.log('JWT verification failed', error);
        return res.status(401).json({ success: false, message: 'Unauthorized, invalid token' });
    }
}

export { authMiddleware };
