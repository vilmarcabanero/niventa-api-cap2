import Adminuser from '../../models/Adminuser.js';
import bcrypt from 'bcrypt';

export const register = (req, res) => {
	try {
		let userByEmail = { email: req.body.email };
		const { firstName, lastName, email, mobileNo, password, confirmPassword } =
			req.body;
		const [username] = email.split('@');

		Adminuser.findOne(userByEmail)
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

				const newAdminuser = new Adminuser({
					firstName: firstName,
					lastName: lastName,
					email: email,
					username: username,
					password: hashedPw,
					mobileNo: mobileNo,
				});

				const _Adminuser = {
					name: newAdminuser.fullName,
					username: username,
					email: req.body.email,
					mobileNo: req.body.mobileNo,
				};

				newAdminuser
					.save()
					.then(user => {
						if (user) {
							return res.send({
								message: 'Admin user created successfully.',
								user: _Adminuser,
							});
						}
					})
					.catch(err => {
						console.log(err);
					});
			})
			.catch(err => {
				console.log(err);
			});
	} catch (err) {
		console.log(err);
	}
};
