import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: [true, 'Please provide a first name.'],
		},
		lastName: {
			type: String,
			required: [true, 'Please provide a last name.'],
		},
		email: {
			type: String,
			unique: true,
			required: [true, 'Please provide a last name.'],
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
			required: [true, 'Please provide a mobile number.'],
		},
	},
	{
		timestamps: true,
	}
);

UserSchema.virtual('fullName').get(function () {
	return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model('User', UserSchema);
