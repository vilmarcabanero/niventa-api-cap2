import mongoose from 'mongoose';

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

export default mongoose.model('Adminuser', AdminuserSchema);
