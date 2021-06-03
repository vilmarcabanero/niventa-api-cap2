import jwt from 'jsonwebtoken';

export const createAccessToken = user => {
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin,
	};

	return jwt.sign(data, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_TOKEN_EXPIRE,
	});
};

export const verify = (req, res, next) => {
	let token = req.headers.authorization;
	console.log(token);

	if (token) {
		token = token.slice(7, token.length);

		jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
			if (err) {
				return res.send({ auth: 'Invalid verification of token or secret.' });
			} else {
				console.log(decoded);
				req.user = decoded;
				next();
			}
		});
	} else {
		return res.send({ auth: 'Please log in.' });
	}
};

export const verifyAdmin = (req, res, next) => {
	console.log(req.user);
	if (req.user.isAdmin) {
		next();
	} else {
		res.send({ auth: 'Only admin user can access this route.' });
	}
};
