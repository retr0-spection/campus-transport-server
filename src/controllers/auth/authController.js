import jwt from 'jsonwebtoken';
import User from '../../models/User.js'; // Assuming the User model is in the 'models' directory

// Secret key for JWT (ideally stored in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your_refresh_secret_key';
const REFRESH_EXPIRATION = process.env.REFRESH_EXPIRATION || '7d';

// Register a new user
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user
        const newUser = new User({
            email,
            password // The password will be hashed in the User model's pre-save hook
        });

        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check the password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Create JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
        const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRATION });

        res.status(200).json({
            message: 'Login successful',
            token,
            refresh_token: refreshToken
        });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Logout user
export const logout = (req, res) => {
    // For stateless JWT authentication, you can handle logout on the client side by deleting the token.
    res.status(200).json({ message: 'Logout successful' });
};

// Get current user's profile
export const me = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming the user ID is stored in req.user by a middleware
        const user = await User.findById(userId).select('-password'); // Exclude password from the returned user

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Refresh JWT token
export const refresh = (req, res) => {
    const refreshToken = req.headers.authorization.split(' ')[1];

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not provided' });
    }

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        const newToken = jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

        res.status(200).json({
            token: newToken,
            refresh_token: refreshToken // Optionally, issue a new refresh token here as well
        });
    } catch (error) {
        res.status(403).json({ message: 'Invalid refresh token', error: error.message });
    }
};
