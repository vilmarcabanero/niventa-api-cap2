import User from '../../models/User.js';
import bcrypt from 'bcrypt';

export const register = (req, res) => {
	try {
		let userByEmail = { email: req.body.email };
		const { firstName, lastName, email, mobileNo, password, confirmPassword } =
			req.body;
		const [username] = email.split('@');
		console.log(username);

		User.findOne(userByEmail)
			.then(user => {
				if (user) {
					return res.status(400).send({
						message: `${userByEmail.email} is already registered.`,
					});
				}

				if (password !== confirmPassword) {
					return res.status(400).send({
						message: `Passwords do not match.`,
					});
				}

				const hashedPw = bcrypt.hashSync(password, 10);

				const newUser = new User({
					firstName: firstName,
					lastName: lastName,
					email: email,
					username: username,
					password: hashedPw,
					isAdmin: true,
					mobileNo: mobileNo,
				});

				const _newUser = {
					name: newUser.fullName,
					username: username,
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
