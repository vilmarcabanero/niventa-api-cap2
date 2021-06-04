import express from 'express';
const router = express.Router();
import * as o from '../controllers/order.js';
import * as mAuth from '../middlewares/auth.js';

router.post('/', mAuth.verify, o.createOrder);

export default router;
