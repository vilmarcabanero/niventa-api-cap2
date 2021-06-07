import express from 'express';
const router = express.Router();
import * as o from '../controllers/order.js';
import * as mAuth from '../middlewares/auth.js';

router.get('/myorders', mAuth.verify, o.getMyOrders);
router.get('/all', mAuth.verify, mAuth.verifyAdmin, o.getAllOrders);
router.get('/seller', mAuth.verify, mAuth.verifyAdmin, o.getAllOrdersForSeller);
router.get(
	'/customer/:username',
	mAuth.verify,
	mAuth.verifyAdmin,
	o.getOrdersByCustomer
);
router.get('/mycustomers', mAuth.verify, mAuth.verifyAdmin, o.getMyCustomers);
router.post('/', mAuth.verify, o.createOrder);

export default router;
