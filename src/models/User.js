import mongoose from 'mongoose';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema(
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
			default: false,
		},
		mobileNo: {
			type: String,
			required: true,
		},
		orders: [
			{
				totalAmount: {
					type: Number,
					required: true,
				},
				purchasedOn: {
					type: Date,
					default: new Date(),
				},
				items: [
					{
						productId: {
							type: String,
							required: true,
						},
						productName: {
							type: String,
							required: true,
						},
						productPrice: {
							type: Number,
							required: true,
						},
						purchasedQty: {
							type: Number,
							required: true,
						},
						subTotal: {
							type: Number,
							required: true,
						},
						seller: {
							type: String,
							required: true,
						},
						customer: {
							type: String,
							required: true,
						},
					},
				],
			},
		],
	},
	{
		timestamps: true,
	}
);

UserSchema.virtual('fullName').get(function () {
	return `${this.firstName} ${this.lastName}`;
});

UserSchema.methods.getResetPasswordToken = function () {
	const resetToken = crypto.randomBytes(20).toString('hex');

	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);

	return resetToken;
};

export default mongoose.model('User', UserSchema);
