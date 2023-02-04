import express from 'express';
import { buySubscription, cancelSubscription } from '../controllers/Payment.js';
import { isAuthenticated, } from '../middlewares/auth.js';
const router = express.Router();

router.route('/create-subscription').post( isAuthenticated,buySubscription);
router.route('/cancel-subscription').delete( isAuthenticated,cancelSubscription);

export default router;