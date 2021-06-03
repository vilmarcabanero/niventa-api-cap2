import express from 'express';
const router = express.Router();
import * as p from '../controllers/product.js';

router.get('/active', p.getActiveProducts);

export default router;
