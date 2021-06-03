import User from '../../models/User.js';
import bcrypt from 'bcrypt';

export const register = (req, res) => {
	try {
		let userByEmail = { email: req.body.email };
		const { password, confirmPassword } = req.body;

		User.findOne(userByEmail)
			.then(user => {
				if (user) {
					return res.status(401).send({
						message: `${userByEmail.email} is already registered.`,
					});
				}

				if (password !== confirmPassword) {
					return res.status(401).send({
						message: `Passwords do not match.`,
					});
				}

				const hashedPw = bcrypt.hashSync(password, 10);

				const newUser = new User({
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					email: req.body.email,
					password: hashedPw,
					isAdmin: true,
					mobileNo: req.body.mobileNo,
				});

				const _newUser = {
					name: newUser.fullName,
					email: req.body.email,
					mobileNo: req.body.mobileNo,
				};

				newUser
					.save()
					.then(user => {
						if (user) {
							return res.send({
								message: 'Admin user created successfully.',
								user: _newUser,
							});
						}
					})
					.catch(err => {
						console.log(err.message);
					});
			})
			.catch(err => {
				console.log(err.message);
			});
	} catch (err) {
		console.log(err.message);
	}
};
