import express from 'express';
import { getAdminDashboardStats, getDashboardStats } from '../controller/dashboard.controller.js';
import { verifyToken } from '../middleware/verify.token.js';

const dashboardRoute = express.Router();

dashboardRoute.get('/', verifyToken, getDashboardStats);
dashboardRoute.get('/admin', verifyToken, getAdminDashboardStats);

export default dashboardRoute;
