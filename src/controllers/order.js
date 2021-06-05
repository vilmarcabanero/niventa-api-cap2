import User from '../models/User.js';
import Product from '../models/Product.js';
import Adminuser from '../models/Adminuser.js';

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
						} ${foundProduct.quantity <= 1 ? 'piece' : 'pieces'}`,
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
									} ${product.quantity <= 1 ? 'piece' : 'pieces'}`,
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

export const createOrderV2Okay = async (req, res) => {
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

							if (purchasedQty > product.quantity) {
								return res.status(400).send({
									message: `Not enough stocks. You order ${purchasedQty} ${
										product.quantity <= 1 ? 'piece' : 'pieces'
									} but the current stock has ${product.quantity} ${
										product.quantity <= 1 ? 'piece' : 'pieces'
									}.`,
								});
							}

							const orderedProduct = {
								productId: product._id,
								productName: product.name,
								productPrice: product.price,
								purchasedQty: purchasedQty,
								subTotal: subTotal,
								seller: product.seller,
								customer: req.user.username,
							};

							newOrder.items.push(orderedProduct);
							newOrder.totalAmount = totalAmount;

							product.quantity -= purchasedQty;

							if (product.quantity > 0) {
								product.save();
							} else {
								product.isActive = false;
								product.save();
							}

							if (index === foundProductIds.length - 1) {
								// console.log('Total amount: ', totalAmount);
								// console.log(newOrder);

								foundUser.orders.push(newOrder);
								foundUser.save();

								// console.log(foundUser.orders[foundUser.orders.length - 1]._id);

								return res.send({
									message: 'You created an order successfully.',
									details: newOrder,
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

export const createOrder = async (req, res) => {
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

				const newOrderAdmin = {
					totalAmount: 0,
					items: [],
				};

				const ordersArr = [];

				// let totalAmountAdmin = 0;

				productIds.forEach((productId, index) => {
					Product.findById(productId)
						.then(product => {
							const itemPrice = product.price;
							const purchasedQty = productPurchasedQties[index];
							const subTotal = itemPrice * purchasedQty;

							totalAmount += subTotal;

							if (purchasedQty > product.quantity) {
								return res.status(400).send({
									message: `Not enough stocks. You order ${purchasedQty} ${
										product.quantity <= 1 ? 'piece' : 'pieces'
									} but the current stock has ${product.quantity} ${
										product.quantity <= 1 ? 'piece' : 'pieces'
									}.`,
								});
							}

							const orderedProduct = {
								productId: product._id,
								productName: product.name,
								productPrice: product.price,
								purchasedQty: purchasedQty,
								subTotal: subTotal,
								customer: foundUser.username,
								seller: product.seller,
							};

							newOrder.items.push(orderedProduct);
							newOrder.totalAmount = totalAmount;

							product.quantity -= purchasedQty;

							if (product.quantity > 0) {
								product.save();
							} else {
								product.isActive = false;
								product.save();
							}

							const orderedProductAdmin = {
								productId: product._id,
								productName: product.name,
								productPrice: product.price,
								purchasedQty: purchasedQty,
								subTotal: subTotal,
								customer: foundUser.username,
								seller: product.seller,
							};

							// console.log(product.seller);
							// console.log(orderedProductAdmin)

							Adminuser.find({ username: product.seller })
								.then(users => {
									users.forEach((user, indexSeller) => {
										if (user.username === product.seller) {
											// console.log(
											// 	`${user.username} is the seller of ${product.name}.`
											// );

											if (index === productIds.length - 1) {
												user.orders.push(newOrder);
												user.save();
												// console.log(user.orders);
											}

											// user.orders.push()

											console.log(user.orders);

											user.orders.forEach(order => {
												console.log(
													`order of seller ${user.username}: ${order}`
												);
												// order.items.push(orderedProductAdmin);
											});
											// console.log(
											// 	'Line 333 user.orders.items: ',
											// 	user.orders.items
											// );

											// user.orders.items.push(orderedProductAdmin);
											// user.orders.totalAmount = totalAmount;
											// console.log(user.orders.items);
											// console.log(user.orders.totalAmount);

											// if (index === productIds.length - 1) {
											// 	// user.save();
											// 	console.log('user.save() done.');
											// }

											// console.log(`count for ${user.username}: `, index + 1);
										}
									});
								})
								.catch(err => {
									console.log(err);
								});

							if (index === productIds.length - 1) {
								// console.log('Total amount: ', totalAmount);
								// console.log(newOrder);

								foundUser.orders.push(newOrder);
								foundUser.save();

								// console.log(foundUser.orders[foundUser.orders.length - 1]._id);

								return res.send({
									message: 'You created an order successfully.',
									details: newOrder,
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
								purchasedQty <= 1 ? 'piece' : 'pieces'
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
					totalOrders: orderTotal,
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

export const getAllOrdersOld = (req, res) => {
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

export const getAllOrdersForAdminOld = (req, res) => {
	try {
		const adminUserId = req.user.id;
		const seller = req.user.username;
		Adminuser.findById(adminUserId)
			.then(user => {
				res.send(user);
				console.log(user.username === seller);
				console.log(user.orders);
			})
			.catch(err => console.log(err));
	} catch (err) {
		console.log(err);
	}
};

export const getAllOrdersForAdmin = (req, res) => {
	try {
		let allOrders = [];
		let total = 0;

		User.find()
			.then(users => {
				users.forEach(user => {
					const order = user.orders.map((order, index) => {
						total = index + 1;
						return {
							order: index + 1,
							details: {
								totalAmount: order.items[0].totalAmount,
								items: order.items,
							},
						};
					});

					allOrders.push(order);
				});
			})
			.then(() => {
				res.send({
					message: `Hi ${req.user.firstName}, here is the list of orders by your customers.`,
					totalOrders: total,
					details: allOrders,
				});
			})
			.catch(err => console.log(err));
	} catch (err) {
		console.log(err);
	}
};

export const getAllOrders = (req, res) => {
	try {
		if (req.user.username !== 'vilmarcabanero') {
			return res.status(401).send({
				message: 'Only the super admin can access this route.',
			});
		}

		let allOrders = [];
		let total = 0;
		User.find()
			.then(users => {
				users.forEach(user => {
					const order = user.orders.map((order, index) => {
						total = index + 1;
						return {
							order: index + 1,
							details: order,
						};
					});

					allOrders.push(order);
				});
			})
			.then(() => {
				res.send({
					message: 'Here is the list of all orders.',
					totalOrders: total,
					details: allOrders,
				});
			})
			.catch(err => console.log(err));
	} catch (err) {
		console.log(err);
	}
};
