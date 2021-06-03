import Product from '../models/Product.js';

export const getActiveProducts = (req, res) => {
	try {
		return res.send({message: 'Hello from product.js'})
	} catch (err) {
		console.log({ error: err.message });
		return res.send({ error: err.message });
	}
};


