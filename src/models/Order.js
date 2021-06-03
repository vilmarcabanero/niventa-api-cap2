import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
	totalAmount: {
		type: String,
		required: true,
	},
	purchasedOn: {
		type: Date,
		default: new Date(),
	},
	customerId: {
		type: String,
		required: true,
	},
	items: [
		{
			productId: {
				type: String,
				required: true,
			},
			subTotal: {
				type: Number,
				required: true,
			},
			purchasedQty: {
				type: Number,
				required: true,
			},
		},
	],
});

export default mongoose.model('Order', OrderSchema);
