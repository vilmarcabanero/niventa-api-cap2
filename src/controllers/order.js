import User from '../models/User.js';
import Product from '../models/Product.js';
// import Order from '../models/Order.js';

export const createOrderOld = (req, res) => {
	try {
		User.findById(req.user.id)
			.then(foundUser => {
				if (foundUser.isAdmin) {
					return res.status(401).send({
						message: `Only non-admin users can create an order.`,
					});
				}

				const foundProduct = {
					price: 50,
					quantity: 2,
					_id: '123456789',
					name: '500-Page Valiant Reacord Book',
				};

				const itemPrice = foundProduct.price;

				const purchasedQty = 1;

				const subTotal = itemPrice * purchasedQty;

				const totalAmount = subTotal * 1;

				const newOrder = {
					totalAmount: totalAmount,
					items: [
						{
							productName: foundProduct.name,
							productId: foundProduct._id,
							subTotal: subTotal,
							purchasedQty: purchasedQty,
						},
					],
				};

				foundUser.orders.push(newOrder);
				if (purchasedQty > foundProduct.quantity) {
					return res.status(400).send({
						message: `Not enough stocks. You order ${purchasedQty} pieces but the current stock has ${
							foundProduct.quantity
						} ${foundProduct.quantity === 1 ? 'piece' : 'pieces'}`,
					});
				}
				res.send({ message: 'You created an order successfully.' });
				return foundUser.save();
			})
			.catch(err => {
				console.log(err);
			});
	} catch (err) {
		console.log(err);
	}
};

export const createOrderV1 = (req, res) => {
	try {
		User.findById(req.user.id)
			.then(foundUser => {
				if (foundUser.isAdmin) {
					return res.status(401).send({
						message: `Only non-admin users can create an order.`,
					});
				}

				const foundProductIds = req.body;
				const productIds = foundProductIds.map(item => {
					return item.id;
				});

				const productPurchasedQties = foundProductIds.map(item => {
					return item.purchasedQty;
				});

				productIds.map((productId, index) => {
					Product.findById(productId)
						.then(product => {
							const itemPrice = product.price;
							const purchasedQty = productPurchasedQties[index];
							const subTotal = itemPrice * purchasedQty;

							// totalAmount += subTotal;
							// console.log('sub total', subTotal);
							// console.log('total amount', totalAmount);

							const newOrder = {
								items: [
									{
										productId: product._id,
										productName: product.name,
										subTotal: subTotal,
										purchasedQty: purchasedQty,
									},
								],
							};

							foundUser.orders.push(newOrder);
							if (purchasedQty > product.quantity) {
								return res.status(400).send({
									message: `Not enough stocks. You order ${purchasedQty} pieces but the current stock has ${
										product.quantity
									} ${product.quantity === 1 ? 'piece' : 'pieces'}`,
								});
							}
							// res.send({ message: 'You created an order successfully.' });
							return foundUser.save();
						})
						.then(() => {
							res.send({ message: 'You created an order successfully.' });
						})
						.catch(err => {
							console.log(err);
						});

					// foundUser.orders.push(newOrder)
				});

				res.send({ message: 'You created an order successfully.' });
				return foundUser.save();
			})
			.catch(err => {
				console.log(err);
			});
	} catch (err) {
		console.log(err);
	}
};

export const createOrder = (req, res) => {
	try {
		User.findById(req.user.id)
			.then(foundUser => {
				if (foundUser.isAdmin) {
					return res.status(401).send({
						message: `Only non-admin users can create an order.`,
					});
				}

				const foundProductIds = req.body;
				const productIds = foundProductIds.map(item => {
					return item.id;
				});

				// console.log(productIds.length);

				const productPurchasedQties = foundProductIds.map(item => {
					return item.purchasedQty;
				});

				const newOrder = {
					totalAmount: 0,
					items: [],
				};
				let totalAmount = 0;

				productIds.forEach((productId, index) => {
					Product.findById(productId)
						.then(product => {
							
							const itemPrice = product.price;
							const purchasedQty = productPurchasedQties[index];
							const subTotal = itemPrice * purchasedQty;

							totalAmount += subTotal;

							const orderedProduct = {
								productId: product._id,
								productName: product.name,
								productPrice: product.price,
								purchasedQty: purchasedQty,
								subTotal: subTotal,
							};

							newOrder.items.push(orderedProduct);
							newOrder.totalAmount = totalAmount;

							if (index === productIds.length - 1) {
								// console.log('Total amount: ', totalAmount);
								// console.log(newOrder);

								foundUser.orders.push(newOrder);
								foundUser.save();

								console.log(foundUser.orders[foundUser.orders.length - 1]._id);
								return res.send({
									message: 'You created an order successfully.',
								});
							}
						})
						.catch(err => {
							console.log(err);
						});
				});
			})
			.catch(err => {
				console.log(err);
			});
	} catch (err) {
		console.log(err);
	}
};

export const getMyOrders = (req, res) => {
	try {
		User.findById(req.user.id)
			.then(user => {
				// console.log(user.orders);

				const orderSummary = user.orders.map((order, index) => {
					const totalAmount = order.totalAmount;
					const item = order.items.map((item, index) => {
						const productName = item.productName;
						const subTotal = item.subTotal;
						const purchasedQty = item.purchasedQty;

						return {
							item: index + 1,
							details: `${purchasedQty} ${
								purchasedQty === 1 ? 'piece' : 'pieces'
							} ${productName} for ${subTotal} pesos.`,
						};
					});
					return {
						order: index + 1,
						totalAmount: totalAmount,
						products: item,
					};
				});

				const orderTotal = orderSummary.length;

				// console.log(orderSummary);

				const details = {
					total: orderTotal,
					details: orderSummary,
				};

				return res.send({
					message: `Hello ${req.user.firstName}, here are your orders.`,
					summary: details,
					orders: user.orders,
				});
			})
			.catch(err => console.log(err));
	} catch (err) {
		console.log(err);
	}
};

export const getAllOrders = (req, res) => {
	try {
		const adminUserId = req.user.id;
		User.findById(adminUserId)
			.then(foundAdminUser => {
				User.find({ seller: foundAdminUser.username })
					.then()
					.catch(err => console.log(err));
			})
			.catch(err => console.log(err));
	} catch (err) {
		console.log(err);
	}
};
