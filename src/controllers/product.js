import Product from '../models/Product.js';
import mongoose from 'mongoose';

export const getActiveProducts = (req, res) => {
	try {
		Product.find({ isActive: true })
			.then(products => {
				if (products.length === 0) {
					return res.send({
						message: 'There are no active products.',
					});
				}

				return res.send(products);
			})
			.catch(err => {
				console.log(err.message);
			});
	} catch (err) {
		console.log(err.message);
	}
};

export const getSingleProduct = (req, res) => {
	try {
		const id = mongoose.Types.ObjectId(req.params.id);
		Product.findById(id)
			.then(product => {
				return res.send(product);
			})
			.catch(err => {
				console.log(err.message);
				res.status(400).send(err.message);
			});
	} catch (err) {
		console.log(err.message);
		res.status(400).send(err.message);
	}
};

export const createSingleProduct = (req, res) => {
	try {
		let productByName = { name: req.body.name };

		Product.findOne(productByName)
			.then(product => {
				if (product) {
					return res.status(400).send({
						message: `${productByName.name} is already taken. Please use another name.`,
					});
				}

				const newProduct = new Product({
					name: req.body.name,
					description: req.body.description,
					price: req.body.price,
				});

				const _newProduct = {
					name: req.body.name,
					description: req.body.description,
					price: req.body.price,
				};

				newProduct
					.save()
					.then(user => {
						if (user) {
							return res.send({
								message: 'Product created successfully.',
								product: _newProduct,
							});
						}
					})
					.catch(err => {
						console.log(err.message);
					});
			})
			.catch(err => {
				console.log(err.message);
			});
	} catch (err) {
		console.log(err.message);
	}
};
