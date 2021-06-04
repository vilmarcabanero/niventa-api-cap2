import express from 'express';
const router = express.Router();
import * as o from '../controllers/order.js';
import * as mAuth from '../middlewares/auth.js';

router.get('/myorders', mAuth.verify, o.getMyOrders);
router.get('/all', mAuth.verify, mAuth.verifyAdmin, o.getAllOrders);

router.post('/', mAuth.verify, o.createOrder);

export default router;
