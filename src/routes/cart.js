import express from 'express';
const router = express.Router();
import * as c from '../controllers/cart.js';
import * as mAuth from '../middlewares/auth.js';

router.get('/get', mAuth.verify, c.getCartItems)
router.get('/get/orderhistory', mAuth.verify, c.getOrderHistory)
router.post('/checkout', mAuth.verify, c.checkout);
router.post('/add', mAuth.verify, c.addToCart);
router.put('/update', mAuth.verify, c.updateCart);

router.delete('/clear', mAuth.verify, c.clearCart);
router.delete('/clear/orderhistory', mAuth.verify, c.clearOrderHistory);

export default router;
