import User from '../models/User.js';
import bcrypt from 'bcrypt';
import * as auth from '../middlewares/auth.js';

export const register = (req, res) => {
	try {
		let userByEmail = { email: req.body.email };
		const { password, confirmPassword } = req.body;

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
					email: req.body.email,
					password: hashedPw,
					isAdmin: false,
					mobileNo: mobileNo,
				});

				const _newUser = {
					name: newUser.fullName,
					email: req.body.email,
					mobileNo: mobileNo,
				};

				newUser
					.save()
					.then(user => {
						if (user) {
							return res.send({
								message: 'User created successfully.',
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

export const login = (req, res) => {
	try {
		let userByEmail = { email: req.body.email };

		User.findOne(userByEmail)
			.then(user => {
				if (!user) {
					return res.status(400).send({
						message: `${userByEmail.email} is not yet registered.`,
					});
				}

				const isPasswordCorrect = bcrypt.compareSync(
					req.body.password,
					user.password
				);

				if (isPasswordCorrect) {
					const token = auth.createAccessToken(user);

					return res.send({
						token: token,
						message: `${user.fullName} was logged in successfully.`,
					});
				} else {
					return res.status(400).send({ message: 'Invalid password' });
				}
			})
			.catch(err => {
				console.log(err.message);
			});
	} catch (err) {
		console.log(err.message);
	}
};

export const setAdmin = (req, res) => {
	try {
		User.findByIdAndUpdate(req.params.id, { isAdmin: true }, { new: true })
			.then(user => {
				return res.send({
					message: `${user.fullName} was successfully set as admin.`,
				});
			})
			.catch(err => {
				console.log(err.message);
			});
	} catch (err) {
		console.log(err.message);
	}
};

export const updateUserDetails = async (req, res) => {
	try {
		const foundUser = await User.findOne({ _id: req.user.id });

		const { firstName, lastName, mobileNo } = req.body;

		const updatedUserDetails = {
			firstName: firstName ? firstName : foundUser.firstName,
			lastName: lastName ? lastName : foundUser.lastName,
			mobileNo: mobileNo ? mobileNo : foundUser.mobileNo,
		};

		const updates = {
			previous: {
				firstName: foundUser.firstName,
				lastName: foundUser.lastName,
				mobileNo: foundUser.mobileNo,
			},
			current: {
				firstName: firstName ? firstName : foundUser.firstName,
				lastName: lastName ? lastName : foundUser.lastName,
				mobileNo: mobileNo ? mobileNo : foundUser.mobileNo,
			},
		};

		User.findByIdAndUpdate(req.user.id, updatedUserDetails, { new: true })
			.then(() => {
				return res.send({
					message: 'Your details were updated successfully.',
					updates: updates,
				});
			})
			.catch(err => {
				console.log(err.message);
			});
	} catch (err) {
		console.log(err.message);
	}
};
