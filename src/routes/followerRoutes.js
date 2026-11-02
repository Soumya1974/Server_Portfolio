import express from 'express';
import mongoose from 'mongoose';
import Follower from '../models/Follower.js';
import { getClientIp } from '../utils/getIp.js';

const router = express.Router();

/**
 * Middleware to check database connection
 */
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: 'Database is not connected. Please verify MONGODB_URI in server/.env.',
    });
  }
  next();
};

router.get('/status', checkDbConnection, async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const [existingFollower, count] = await Promise.all([
      Follower.findOne({ ip: clientIp }).lean(),
      Follower.countDocuments(),
    ]);

    return res.json({
      success: true,
      count: count,
      hasFollowed: Boolean(existingFollower),
      ip: process.env.NODE_ENV === 'development' ? clientIp : undefined,
    });
  } catch (error) {
    console.error('Error fetching follower status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve follower status',
    });
  }
});


router.get('/count', checkDbConnection, async (req, res) => {
  try {
    const count = await Follower.countDocuments();
    return res.json({
      success: true,
      count: count,
    });
  } catch (error) {
    console.error('Error fetching follower count:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve follower count',
    });
  }
});

router.post('/', checkDbConnection, async (req, res) => {
  try {
    const clientIp = getClientIp(req);

    // 1. Check if this IP is already following
    const existing = await Follower.findOne({ ip: clientIp });
    if (existing) {
      const count = await Follower.countDocuments();
      return res.status(200).json({
        success: true,
        alreadyFollowing: true,
        hasFollowed: true,
        count: count,
        message: 'You are already following Soumya.',
      });
    }

    // 2. Create new follower document
    try {
      await Follower.create({
        ip: clientIp,
        userAgent: req.headers['user-agent'] || '',
        followedAt: new Date(),
      });
    } catch (insertError) {
      // Handle MongoDB E11000 duplicate key race condition safely
      if (insertError.code === 11000) {
        const count = await Follower.countDocuments();
        return res.status(200).json({
          success: true,
          alreadyFollowing: true,
          hasFollowed: true,
          count: count,
          message: 'You are already following Soumya.',
        });
      }
      throw insertError;
    }

    // 3. Return updated count
    const updatedCount = await Follower.countDocuments();
    return res.status(201).json({
      success: true,
      alreadyFollowing: false,
      hasFollowed: true,
      count: updatedCount,
      message: 'Thank you for following!',
    });
  } catch (error) {
    console.error('Error saving follower:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to follow. Please try again later.',
    });
  }
});

export default router;
