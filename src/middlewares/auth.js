import jwt from 'jsonwebtoken';

export const createAccessToken = user => {
	const data = {
		id: user._id,
		email: user.email,
		fullName: user.fullName,
		isAdmin: user.isAdmin,
	};

	return jwt.sign(data, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_TOKEN_EXPIRE,
	});
};

export const verify = (req, res, next) => {
	let token = req.headers.authorization;

	if (token) {
		token = token.slice(7, token.length);

		jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
			if (err) {
				return res
					.status(401)
					.send({ auth: 'Invalid verification of token and secret.' });
			} else {
				req.user = decoded;
				next();
			}
		});
	} else {
		return res
			.status(401)
			.send({ auth: 'Only logged in users can access this route.' });
	}
};

export const verifyAdmin = (req, res, next) => {
	if (req.user.isAdmin) {
		next();
	} else {
		res.status(401).send({ auth: 'Only admin users can access this route.' });
	}
};
