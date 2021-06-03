import express from 'express';
const router = express.Router();
import * as user from '../controllers/auth.js';
import * as adminUser from '../controllers/admin/auth.js';
import * as mAuth from '../middlewares/auth.js';
import * as v from '../middlewares/vaildators.js';

router.post(
	'/register',
	v.validateRegisterRequest,
	v.isRequestValidated,
	user.register
);
router.post(
	'/admin/register',
	v.validateRegisterRequest,
	v.isRequestValidated,
	adminUser.register
);
router.post('/login', v.validateLoginRequest, v.isRequestValidated, user.login);

router.put('/setadmin/:id', user.setAdmin); //Need pa irestrict to admin only, nagka bug yung code ko. Auth failed kahit admin ang mag access sa route.

export default router;
