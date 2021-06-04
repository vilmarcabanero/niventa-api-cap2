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
				console.log(err);
			});
	} catch (err) {
		console.log(err);
	}
};

export const getProductsByPrice = (req, res) => {
	try {
		Product.find({ price: req.params.price })
			.then(products => {
				if (products.length === 0) {
					return res.send({
						message: `There are no products with price of ${req.params.price}.`,
					});
				}

				return res.send(products);
			})
			.catch(err => {
				console.log(err);
			});
	} catch (err) {
		console.log(err);
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
				console.log(err);
				res.status(400).send(err);
			});
	} catch (err) {
		console.log(err);
		res.status(400).send(err);
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
					quantity: req.body.quantity,
					seller: req.user.fullName,
				});

				const _newProduct = {
					name: req.body.name,
					description: req.body.description,
					price: req.body.price,
					quantity: req.body.quantity,
				};

				newProduct
					.save()
					.then(user => {
						if (user) {
							return res.send({
								message: 'Product created successfully.',
								seller: req.user.fullName,
								details: _newProduct,
							});
						}
					})
					.catch(err => {
						console.log(err);
					});
			})
			.catch(err => {
				console.log(err);
			});
	} catch (err) {
		console.log(err);
	}
};

export const updateProductInfo = async (req, res) => {
	try {
		const foundProduct = await Product.findOne({ _id: req.params.id });

		const { name, description, price } = req.body;

		const updatedProductInfo = {
			name: name ? name : foundProduct.name,
			description: description ? description : foundProduct.description,
			price: price ? price : foundProduct.price,
		};

		const updates = {
			previous: {
				name: foundProduct.name,
				description: foundProduct.description,
				price: foundProduct.price,
			},
			current: {
				name: name ? name : foundProduct.name,
				description: description ? description : foundProduct.description,
				price: price ? price : foundProduct.price,
			},
		};

		Product.findByIdAndUpdate(req.params.id, updatedProductInfo, { new: true })
			.then(() => {
				return res.send({
					message: 'Product info was updated successfully.',
					updates: updates,
				});
			})
			.catch(err => {
				console.log(err);
			});
	} catch (err) {
		console.log(err);
	}
};

export const archiveProduct = async (req, res) => {
	try {
		const foundProduct = await Product.findOne({ _id: req.params.id });

		Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })
			.then(product => {
				return res.send({
					message: `${foundProduct.name} was archived successfully.`,
					details: product,
				});
			})
			.catch(err => {
				console.log(err);
			});
	} catch (err) {
		console.log(err);
	}
};
