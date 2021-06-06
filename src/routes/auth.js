import express from 'express';
const router = express.Router();
import * as auth from '../controllers/auth.js';
import * as adminUser from '../controllers/admin/auth.js';
import * as mAuth from '../middlewares/auth.js';
import * as v from '../middlewares/validators.js';

router.post(
	'/register',
	v.validateRegisterRequest,
	v.isRequestValidated,
	auth.register
);

router.post(
	'/admin/register',
	v.validateRegisterRequest,
	v.isRequestValidated,
	adminUser.register
);

router.post('/login', v.validateLoginRequest, v.isRequestValidated, auth.login);

router.post(
	'/admin/login',
	v.validateLoginRequest,
	v.isRequestValidated,
	adminUser.login
);

router.post('/forgotpassword', auth.forgotPassword);
router.put('/resetpassword/:resetToken', auth.resetPassword);

router.put('/setadmin/:id', mAuth.verify, mAuth.verifyAdmin, auth.setAdmin);
router.put('/update', mAuth.verify, auth.updateUserInfo);

export default router;
