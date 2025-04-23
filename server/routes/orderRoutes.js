import express from 'express';
import { 
  getUserOrders, 
  getOrderById, 
  createOrder, 
  cancelOrder,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id/cancel', cancelOrder);

// Admin routes
router.get('/', admin, getAllOrders);
router.put('/:id/status', admin, updateOrderStatus);

export default router;
