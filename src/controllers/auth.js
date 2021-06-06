import User from '../models/User.js';
import bcrypt from 'bcrypt';
import * as auth from '../middlewares/auth.js';
import crypto from 'crypto';

export const register = (req, res) => {
	try {
		const { firstName, lastName, email, mobileNo, password, confirmPassword } =
			req.body;
		const [username] = email.split('@');

		let userByEmail = { email: email };

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
					username: username,
					email: email,
					password: hashedPw,
					mobileNo: mobileNo,
				});

				const _newUser = {
					name: newUser.fullName,
					username: username,
					email: email,
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
				console.log(err);
			});
	} catch (err) {
		console.log(err);
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
				console.log(err);
			});
	} catch (err) {
		console.log(err);
	}
};

export const updateUserInfo = async (req, res) => {
	try {
		const foundUser = await User.findOne({ _id: req.user.id });

		const { firstName, lastName, mobileNo } = req.body;

		const updatedUserInfo = {
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

		User.findByIdAndUpdate(req.user.id, updatedUserInfo, { new: true })
			.then(() => {
				return res.send({
					message: 'Your info was updated successfully.',
					updates: updates,
				});
			})
			.catch(err => {
				console.log(err);
			});
	} catch (err) {
		console.log(err);
	}
};

export const forgotPassword = async (req, res) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).send({
				message: `${email} is not yet registered.`,
			});
		}

		const resetToken = user.getResetPasswordToken();

		await user.save();

		const message = `Hello ${user.firstName}, please user the above reset token to reset your password.`;

		try {
			return res.send({
				token: resetToken,
				message: message,
			});
		} catch (err) {
			user.resetPasswordToken = undefined;
			user.resetPasswordExpire = undefined;

			await user.save();

			return res.status(500).send('Email could not be sent.');
		}
	} catch (err) {
		console.log(err);
	}
};

export const resetPassword = async (req, res) => {
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(req.params.resetToken)
		.digest('hex');

	try {
		const user = await User.findOne({
			resetPasswordToken,
			resetPasswordExpire: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).send({
				message: 'Invalid reset token.',
			});
		}

		const hashedPw = bcrypt.hashSync(req.body.password, 10);

		user.password = hashedPw;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save();
		return res.send({
			success: true,
			message: `Hello ${user.firstName}, you've successfully reset your password.`,
		});
	} catch (err) {
		console.log(err);
	}
};
