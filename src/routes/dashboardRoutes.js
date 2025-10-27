import express from 'express';
import DashboardController from '../controllers/dashboardController.js';
import { authenticate, requireRoles } from '../middleware/auth.js';

const router = express.Router();


// All dashboard routes require authentication
router.use(authenticate);

// Daily bookings data for charts
router.get('/bookings/daily', 
  requireRoles('PlatformAdmin', 'ClinicAdmin'), 
  DashboardController.getDailyBookings
);

// Hourly revenue data for today
router.get('/revenue/hourly', 
  requireRoles('PlatformAdmin', 'ClinicAdmin'), 
  DashboardController.getHourlyRevenue
);

// Comprehensive dashboard metrics
router.get('/metrics', 
  requireRoles('PlatformAdmin', 'ClinicAdmin'), 
  DashboardController.getDashboardMetrics
);

// Revenue trends over time
router.get('/revenue/trends', 
  requireRoles('PlatformAdmin', 'ClinicAdmin'), 
  DashboardController.getRevenueTrends
);

export default router;