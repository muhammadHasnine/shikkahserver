import express from 'express';
import { contact, courseRequest, getDashboardStats } from '../controllers/Other.js';
import { isAuthenticated,authorizedAdmin } from '../middlewares/auth.js';
const router = express.Router();

router.route('/contact').post(contact);
router.route('/courserequest').post(courseRequest);
router.route('/admin/stats').get(isAuthenticated,authorizedAdmin,getDashboardStats);

export default router;