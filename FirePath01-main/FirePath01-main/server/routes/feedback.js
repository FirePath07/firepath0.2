const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

const JWT_SECRET = process.env.JWT_SECRET || 'firepath_secret_key_123';

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Middleware to check if user is admin
const verifyAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user && user.email === 'firepathjjrp@gmail.com') {
            next();
        } else {
            res.status(403).json({ msg: 'Access denied: Admin only' });
        }
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @route   POST api/feedback
// @desc    Submit feedback/suggestion
router.post('/', verifyToken, async (req, res) => {
    try {
        const { type, content } = req.body;
        const user = await User.findById(req.user.id);

        const newFeedback = new Feedback({
            userId: req.user.id,
            userName: user.name,
            userEmail: user.email,
            type,
            content
        });

        const feedback = await newFeedback.save();
        res.json(feedback);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/feedback/me
// @desc    Get current user's feedback
router.get('/me', verifyToken, async (req, res) => {
    try {
        const feedback = await Feedback.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(feedback);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/feedback/admin/users
// @desc    Get all users (Admin only)
router.get('/admin/users', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/feedback/admin/suggestions
// @desc    Get all feedback/suggestions (Admin only)
router.get('/admin/suggestions', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const suggestions = await Feedback.find().sort({ createdAt: -1 });
        res.json(suggestions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/feedback/admin/:id/reply
// @desc    Reply to a feedback (Admin only)
router.put('/admin/:id/reply', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { reply } = req.body;
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { $set: { adminReply: reply, isRead: true } },
            { new: true }
        );
        res.json(feedback);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/feedback/admin/:id/read
// @desc    Mark feedback as read (Admin only)
router.put('/admin/:id/read', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { $set: { isRead: true } },
            { new: true }
        );
        res.json(feedback);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/feedback/admin/suggestions/:id
// @desc    Delete a feedback (Admin only)
router.delete('/admin/suggestions/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Feedback removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/feedback/admin/users/:id
// @desc    Delete a user (Admin only)
router.delete('/admin/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (userToDelete.email === 'firepathjjrp@gmail.com') {
            return res.status(400).json({ msg: 'Cannot delete admin account' });
        }

        await User.findByIdAndDelete(req.params.id);
        // Also delete their feedback? Maybe.
        await Feedback.deleteMany({ userId: req.params.id });

        res.json({ msg: 'User and associated data removed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
