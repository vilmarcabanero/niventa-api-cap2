import jwt from 'jsonwebtoken';
const secret = 'CourseBookingAPI';

export const createAccessToken = user => {
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin,
	};

	return jwt.sign(data, secret, {});
};

export const verify = (req, res, next) => {
	let token = req.headers.authorization;

	if (token) {
		token = token.slice(7, token.length);

		jwt.verify(token, secret, function (err, decoded) {
			if (err) {
				res.send({ auth: 'failed' });
			} else {
				// console.log(decoded);
				req.user = decoded;
				next();
			}
		});
	} else {
		res.send({ auth: 'failed' });
	}
};

export const verifyAdmin = (req, res, next) => {
	if (req.user.isAdmin) {
		next();
	} else {
		res.send({ auth: 'failed' });
	}
};
