import express from 'express';
const router = express.Router();
import * as p from '../controllers/product.js';
import * as v from '../middlewares/validators.js';
import * as mAuth from '../middlewares/auth.js';

router.get('/active', p.getActiveProducts);
router.get('/:id', p.getSingleProduct);

router.post(
	'/',
	v.validateCreateProductRequest,
	v.isRequestValidated,
	mAuth.verify,
	mAuth.verifyAdmin,
	p.createSingleProduct
);

router.put('/update/:id', mAuth.verify, mAuth.verifyAdmin, p.updateProductInfo);
router.put('/archive/:id', mAuth.verify, mAuth.verifyAdmin, p.archiveProduct);
export default router;
