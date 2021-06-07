import mongoose from 'mongoose';
import crypto from 'crypto';

const AdminuserSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			unique: true,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		resetPasswordToken: String,
		resetPasswordExpire: Date,
		isAdmin: {
			type: Boolean,
			default: true,
		},
		mobileNo: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

AdminuserSchema.virtual('fullName').get(function () {
	return `${this.firstName} ${this.lastName}`;
});

AdminuserSchema.methods.getResetPasswordToken = function () {
	const resetToken = crypto.randomBytes(20).toString('hex');

	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);

	return resetToken;
};

export default mongoose.model('Adminuser', AdminuserSchema);
