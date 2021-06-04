import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
	},
	seller: {
		type: String,
		required: true,
	},
	isActive: {
		type: Boolean,
		default: true,
	},
	createdOn: {
		type: Date,
		default: new Date(),
	},
	orders: [
		{
			orderId: {
				type: String,
				required: true,
			},
			purchasedOn: {
				type: Date,
				default: new Date(),
			},
		},
	],
});

export default mongoose.model('Product', ProductSchema);
