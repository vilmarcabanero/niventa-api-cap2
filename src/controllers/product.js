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

export const getMyProducts = (req, res) => {
	try {
		Product.find({ seller: req.user.username })
			.then(products => {
				if (products.length === 0) {
					return res.send({
						message: `You have no products yet.`,
					});
				}

				const productSummary = products.map(product => {
					const quantity = product.quantity;
					const name = product.name;
					return `${quantity} ${quantity === 1 ? 'piece' : 'pieces'} ${name}`;
				});
				const productTotal = productSummary.length;

				console.log(productSummary);

				const details = {
					total: productTotal,
					details: productSummary,
				};

				return res.send({
					message: `Hello ${req.user.fullName}, here is the list of your products.`,
					summary: details,
					products: products,
				});
			})
			.catch(err => {
				console.log(err);
			});
	} catch (err) {
		console.log(err);
	}
};

export const getProductsBySeller = (req, res) => {
	try {
		const seller = req.query.username;
		Product.find({ seller: seller })
			.then(products => {
				if (products.length === 0) {
					return res.send({
						message: `${seller} has no products to sell.`,
					});
				}

				const productSummary = products.map(product => {
					const quantity = product.quantity;
					const name = product.name;
					return `${quantity} ${quantity === 1 ? 'piece' : 'pieces'} ${name}`;
				});
				const productTotal = productSummary.length;

				const details = {
					total: productTotal,
					details: productSummary,
				};

				return res.send({
					message: `Here is the list of ${seller}'s products.`,
					summary: details,
					products: products,
				});
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
		const { name, description, price, quantity } = req.body;
		let productByName = { name: name };

		Product.findOne(productByName)
			.then(product => {
				if (product) {
					return res.status(400).send({
						message: `${productByName.name} is already taken. Please use another name.`,
					});
				}

				const newProduct = new Product({
					name: name,
					description: description,
					price: price,
					quantity: quantity,
					seller: req.user.username,
				});

				const _newProduct = {
					name: name,
					description: description,
					price: price,
					quantity: quantity,
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
