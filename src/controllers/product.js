import Product from '../models/Product.js';
import mongoose from 'mongoose';

export const getActiveProducts = (req, res) => {
	try {
		const filter = {
			$match: {
				isActive: true,
			},
		};

		const sort = {
			$sort: {
				price: 1,
			},
		};

		Product.aggregate([filter, sort])
			.then(products => {
				if (products.length === 0) {
					return res.send({
						message: 'There are no active products.',
					});
				}

				const productSummary = products.map(product => {
					return {
						name: product.name,
						price: product.price,
						stock: product.quantity,
						seller: product.seller,
					};
				});

				const productTotal = productSummary.length;

				const details = {
					total: productTotal,
					details: productSummary,
				};

				return res.send({
					message: `Here is the list of active products.`,
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

export const getInactiveProducts = (req, res) => {
	try {
		const filter = {
			$match: {
				isActive: false,
			},
		};

		const sort = {
			$sort: {
				price: 1,
			},
		};

		Product.aggregate([filter, sort])
			.then(products => {
				if (products.length === 0) {
					return res.send({
						message: 'There are no inactive products.',
					});
				}

				const productSummary = products.map(product => {
					return {
						name: product.name,
						price: product.price,
						stock: product.quantity,
						seller: product.seller,
					};
				});

				const productTotal = productSummary.length;

				const details = {
					total: productTotal,
					details: productSummary,
				};

				return res.send({
					message: `Here is the list of inactive products.`,
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

export const getActiveProductIds = (req, res) => {
	try {
		Product.find({ isActive: true })
			.then(products => {
				if (products.length === 0) {
					return res.send({
						message: 'There are no active products.',
					});
				}

				const foundProducts = products.map((product, index) => {
					return {
						item: index + 1,
						name: product.name,
						id: product._id,
					};
				});

				return res.send({
					message: 'Here is the list of ids of active products.',
					products: foundProducts,
				});
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
		const { price } = req.params;

		Product.find({ price: price })
			.then(products => {
				if (products.length === 0) {
					return res.send({
						message: `There are no products with price of ${price}.`,
					});
				}

				// return res.send(products);

				const productSummary = products.map(product => {
					const quantity = product.quantity;
					const name = product.name;
					return {
						name: name,
						stock: quantity,
					};
				});

				const productTotal = productSummary.length;

				const details = {
					total: productTotal,
					details: productSummary,
				};

				return res.send({
					message: `Here is the list of products which has a price of ${price} pesos.`,
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

export const getActiveProductsByPrice = (req, res) => {
	try {
		let price = req.params.price;
		price = parseInt(price);

		const filter = {
			$match: {
				$and: [
					{
						price: price,
					},
					{
						isActive: true,
					},
				],
			},
		};

		Product.aggregate([filter])
			.then(products => {
				if (products.length === 0) {
					return res.send({
						message: `There are no active products with price of ${price}.`,
					});
				}

				// return res.send(products);

				const productSummary = products.map(product => {
					const quantity = product.quantity;
					const name = product.name;
					return {
						name: name,
						stock: quantity,
					};
				});

				const productTotal = productSummary.length;

				const details = {
					total: productTotal,
					details: productSummary,
				};

				return res.send({
					message: `Here is the list of active products which has a price of ${price} pesos.`,
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

export const getMyProducts = (req, res) => {
	try {
		const filter = {
			$match: {
				seller: req.user.username,
			},
		};

		const sort = {
			$sort: {
				price: 1,
			},
		};

		// const [firstName] = req.user.fullName.split(' ');

		Product.aggregate([filter, sort])
			.then(products => {
				if (products.length === 0) {
					return res.send({
						message: `Hi ${req.user.firstName}, you have no products yet.`,
					});
				}

				const productSummary = products.map(product => {
					return {
						name: product.name,
						price: product.price,
						stock: product.quantity,
					};
				});
				const productTotal = productSummary.length;

				console.log(productSummary);

				const details = {
					total: productTotal,
					details: productSummary,
				};

				return res.send({
					message: `Hello ${req.user.firstName}, here is the list of your products.`,
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
					return {
						name: product.name,
						price: product.price,
						stock: product.quantity,
					};
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

export const getProductsByPriceRange = (req, res) => {
	try {
		const start = parseInt(req.query.start);
		const end = parseInt(req.query.end);

		const filter = {
			$match: {
				price: {
					$gte: start,
					$lte: end,
				},
			},
		};

		const sort = {
			$sort: {
				price: 1,
			},
		};

		Product.aggregate([filter, sort])
			.then(products => {
				if (products.length === 0) {
					return res.send({
						message: `There are no products that range from ${start} and ${end} pesos.`,
					});
				}

				const productSummary = products.map(product => {
					return {
						name: product.name,
						price: product.price,
						stock: product.quantity,
					};
				});

				const productTotal = productSummary.length;

				const details = {
					total: productTotal,
					details: productSummary,
				};

				return res.send({
					message: `Here is the list of products that ranges between ${start} and ${end} pesos. `,
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

export const getActiveProductsByPriceRange = (req, res) => {
	try {
		const start = parseInt(req.query.start);
		const end = parseInt(req.query.end);

		const filter = {
			$match: {
				$and: [
					{
						price: {
							$gte: start,
							$lte: end,
						},
					},
					{
						isActive: true,
					},
				],
			},
		};

		const sort = {
			$sort: {
				price: 1,
			},
		};

		Product.aggregate([filter, sort])
			.then(products => {
				if (products.length === 0) {
					return res.send({
						message: `There are no active products that range from ${start} and ${end} pesos.`,
					});
				}

				const productSummary = products.map(product => {
					return {
						name: product.name,
						price: product.price,
						stock: product.quantity,
					};
				});

				const productTotal = productSummary.length;

				const details = {
					total: productTotal,
					details: productSummary,
				};

				return res.send({
					message: `Here is the list of active products that ranges between ${start} and ${end} pesos. `,
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

		const options = {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		};
		let today = new Date();
		today = today.toLocaleDateString('en-US', options);

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
					createdOn: today,
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
