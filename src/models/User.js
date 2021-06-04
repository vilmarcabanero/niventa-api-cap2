import mongoose from 'mongoose';

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

export default mongoose.model('User', UserSchema);
