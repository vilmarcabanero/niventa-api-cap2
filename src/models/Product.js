import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please provide the product name.'],
	},
	description: {
		type: String,
		required: [true, 'Please provide the product description.'],
	},
	price: {
		type: Number,
		required: [true, 'Please provide the product price.'],
	},
	isActive: {
		type: Boolean,
		default: true,
	},
	createdOn: {
		type: Date,
		default: new Date(),
	},
});

export default mongoose.model('Product', ProductSchema);
