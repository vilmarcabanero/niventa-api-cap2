import User from '../models/User.js';
import Product from '../models/Product.js';

export const checkout = async (req, res) => {
	try {
		await User.findById(req.user.id)
			.then(async user => {
				if (user.isAdmin) {
					return res.status(401).send({
						message: `Only non-admin users can create an order.`,
					});
				}

				if (!user.carts.length) {
					return res.send({
						message: `Hello ${req.user.firstName}, your cart is empty, please add some items to your cart to proceed to checkout.`,
					});
				}

				user.orders.push(user.carts[0]);
				await user.save();

				let cart = {};
				let totalItems = 0;

				const cartSummary = user.carts.map(cart => {
					const totalAmount = cart.totalAmount;

					const item = cart.items.map((item, itemIndex) => {
						totalItems++;
						return {
							item: itemIndex + 1,
							details: {
								name: item.productName,
								price: item.productPrice,
								purchasedQty: item.purchasedQty,
								subTotal: item.subTotal,
								seller: item.seller,
							},
						};
					});
					return {
						addedOn: cart.addedOn,
						totalItems: totalItems,
						totalAmount: totalAmount,
						items: item,
					};
				});

				const itemTotal = cartSummary.length;
				cart = cartSummary[0];

				if (!itemTotal) {
					return res.status(400).send({
						message: `Hello ${req.user.firstName}, your cart is empty, please proceed to add to cart route to add new items.`,
					});
				}

				user.carts = [];
				await user.save();

				return res.send({
					message: `Hi ${req.user.firstName}, you placed your order successfully.`,
					summary: cart,
				});
			})
			.catch(err => {
				console.log(err);
			});
	} catch (err) {
		console.log(err);
	}
};

export const addCart = async (req, res) => {
	try {
		await User.findById(req.user.id)
			.then(async user => {
				if (user.isAdmin) {
					return res.status(401).send({
						message: `Only non-admin users can create an order.`,
					});
				}

				if (user.carts.length) {
					return res.send({
						message: `Hello ${req.user.firstName}, your cart is not empty, please proceed to your cart to remove or add items.`,
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

				const newCart = {
					addedOn: '',
					totalItems: 0,
					totalAmount: 0,
					items: [],
				};
				let totalAmount = 0;

				let productCount = 0;

				const options = {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				};
				const today = new Date();
				newCart.addedOn = today.toLocaleDateString('en-US', options);

				// console.log(newCart);

				await productIds.forEach(async (productId, index) => {
					// productCount++;
					// console.log(productCount, 'product count');
					await Product.findById(productId)
						.then(async product => {
							const itemPrice = product.price;
							const purchasedQty = productPurchasedQties[index];
							const subTotal = itemPrice * purchasedQty;

							totalAmount += subTotal;
							if (purchasedQty > product.quantity) {
								return res.status(400).send({
									message: `Not enough stocks. You added ${purchasedQty} ${
										product.quantity <= 1 ? 'piece' : 'pieces'
									} in your cart but the current stock has ${
										product.quantity
									} ${product.quantity <= 1 ? 'piece' : 'pieces'}.`,
								});
							}

							product.quantity -= purchasedQty;

							if (product.quantity > 0) {
								await product.save();
							} else {
								product.isActive = false;
								await product.save();
							}

							let addedProduct = {
								productId: product._id,
								productName: product.name,
								productPrice: product.price,
								purchasedQty: purchasedQty,
								remainingQty: product.quantity,
								subTotal: subTotal,
								seller: product.seller,
								customer: req.user.username,
							};

							// console.log(index + 1, 'index');
							// console.log(productCount, 'Product count');
							// console.log(productIds[index].length, 'productId.length');

							newCart.items.push(addedProduct);
							newCart.totalAmount = totalAmount;
							newCart.totalItems = newCart.items.length;

							if (newCart.items.length === productIds.length) {
								user.carts.push(newCart);
								await user.save();
								console.log('Success');

								return res.send({
									message: `Hi ${req.user.firstName}, you've successfully added items to your cart.`,
									details: newCart,
								});
							}
						})
						.catch(err => {
							console.log(err);
						});

					// console.log('Success')
				});

				// console.log(newCart);
			})
			.catch(err => console.log(err));
	} catch (err) {
		console.log(err);
	}
};

export const updateCart = async (req, res) => {
	try {
		await User.findById(req.user.id)
			.then(user => {
				if (user.isAdmin) {
					return res.status(401).send({
						message: `Only non-admin users can create an order.`,
					});
				}

				if (!user.carts.length) {
					return res.status(400).send({
						message: `Hello ${req.user.firstName}, your cart is empty, please proceed to add to cart route to add new items.`,
					});
				}

				if (user.carts.length) {
					return res.send({
						message: 'Successfully updated items of your cart.',
					});
				}

				const foundProductIds = req.body;
				const productIds = foundProductIds.map(item => {
					return item.id;
				});

				console.log(productIds.length);

				const productPurchasedQties = foundProductIds.map(item => {
					return item.purchasedQty;
				});

				const newCart = {
					totalAmount: 0,
					totalItems: 0,
					items: [],
				};
				let totalAmount = 0;

				productIds.forEach((productId, index) => {
					Product.findById(productId)
						.then(async product => {
							const itemPrice = product.price;
							const purchasedQty = productPurchasedQties[index];
							const subTotal = itemPrice * purchasedQty;

							totalAmount += subTotal;

							if (purchasedQty > product.quantity) {
								return res.status(400).send({
									message: `Not enough stocks. You added ${purchasedQty} ${
										product.quantity <= 1 ? 'piece' : 'pieces'
									} in your cart but the current stock has ${
										product.quantity
									} ${product.quantity <= 1 ? 'piece' : 'pieces'}.`,
								});
							}

							const addedProduct = {
								productId: product._id,
								productName: product.name,
								productPrice: product.price,
								purchasedQty: purchasedQty,
								subTotal: subTotal,
								seller: product.seller,
								customer: req.user.username,
							};

							newCart.items.push(addedProduct);
							newCart.totalAmount = totalAmount;
							newCart.totalItems = newCart.items.length;

							if (index === productIds.length - 1) {
								user.orders.push(newCart);
								await user.save();

								return res.send({
									message: `Hi ${req.user.firstName}, you've successfully added items to your cart.`,
									details: newCart,
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

export const clearCart = async (req, res) => {
	try {
		await User.findById(req.user.id)
			.then(async user => {
				if (user.isAdmin) {
					return res.status(401).send({
						message: `Only non-admin users can create an order.`,
					});
				}

				if (!user.carts.length) {
					return res.status(400).send({
						message: `Hello ${req.user.firstName}, your cart is empty, please proceed to add to cart route to add new items.`,
					});
				}

				//Kunin muna ang remaining quantity, i.add ang remaining quantity plus the purchased quantity at yun ang original quantity, ilagay or i.update ang product.quantity sa value ng original quantity.

				const originalQties = [];
				const productIds = [];
				const oldCart = {
					addedOn: '',
					totalItems: 0,
					totalAmount: 0,
					items: [],
				};
				// const cartItems = [];

				let totalAmount = 0;

				user.carts[0].items.forEach(item => {
					// console.log(item);
					totalAmount += item.subTotal;

					oldCart.items.push(item);
					productIds.push(item.productId);
					originalQties.push(item.purchasedQty + item.remainingQty);
				});

				oldCart.addedOn = user.carts[0].addedOn;
				oldCart.totalAmount = totalAmount;
				oldCart.totalItems = oldCart.items.length;

				productIds.forEach((productId, productIdIndex) => {
					Product.findById(productId)
						.then(async product => {
							product.quantity = originalQties[productIdIndex];

							await product.save();
						})
						.catch(err => console.log(err));
				});

				user.carts = [];
				await user.save();

				oldCart.items = oldCart.items.map(item => {
					return {
						productName: item.productName,
						productPrice: item.productPrice,
						purchasedQty: item.purchasedQty,
						remainingQty: item.remainingQty + item.purchasedQty,
						subTotal: item.subTotal,
						seller: item.seller,
					};
				});

				if (!user.carts.length) {
					return res.send({
						message: `Hello ${req.user.firstName}, you've successfully removed all items of your cart.`,
						details: oldCart,
					});
				} else {
					return res.status(500).send({
						error: 'Removing the items on your cart failed.',
					});
				}
			})
			.catch(err => console.log(err));
	} catch (err) {
		console.log(err);
	}
};

export const getCartItems = async (req, res) => {
	try {
		User.findById(req.user.id)
			.then(user => {
				// console.log(user.orders);

				let cart = {};
				let totalItems = 0;

				const cartSummary = user.carts.map(cart => {
					const totalAmount = cart.totalAmount;

					const item = cart.items.map((item, itemIndex) => {
						totalItems++;
						return {
							item: itemIndex + 1,
							details: {
								name: item.productName,
								price: item.productPrice,
								purchasedQty: item.purchasedQty,
								subTotal: item.subTotal,
								seller: item.seller,
							},
						};
					});
					return {
						addedOn: cart.addedOn,
						totalItems: totalItems,
						totalAmount: totalAmount,
						items: item,
					};
				});

				const itemTotal = cartSummary.length;
				cart = cartSummary[0];

				if (!itemTotal) {
					return res.status(400).send({
						message: `Hello ${req.user.firstName}, your cart is empty, please consider adding some items to your cart.`,
					});
				}

				// console.log(orderSummary);

				return res.send({
					message: `Hello ${req.user.firstName}, here is the list of items in your cart.`,
					summary: cart,
				});
			})
			.catch(err => console.log(err));
	} catch (err) {
		console.log(err);
	}
};

export const getCheckoutHistory = (req, res) => {
	try {
		const allOrders = [];
		let totalOrders = 0;
		User.findOne({ username: req.user.username })
			.then(user => {
				if (!user.orders.length) {
					return res.send({
						message: `Hi ${req.user.firstName}, the history of your orders is currently empty.`,
					});
				}

				// const order = user.orders.map((order, orderIndex) => {
				// 	totalOrders++;
				// 	return {
				// 		order: orderIndex + 1,
				// 		details: order,
				// 	};
				// });

				const orderSummary = user.orders.map((order, index) => {
					const totalAmount = order.totalAmount;

					const item = order.items.map((item, index) => {
						return {
							item: index + 1,
							details: {
								name: item.productName,
								price: item.productPrice,
								purchasedQty: item.purchasedQty,
								subTotal: item.subTotal,
								seller: item.seller,
							},
						};
					});
					return {
						order: index + 1,
						purchasedOn: order.purchasedOn,
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
					message: `Hi ${req.user.firstName}, here is the history of your placed orders.`,
					summary: details,
				});

				// console.log(order);

				// if (user.orders.length !== 0) {
				// 	allOrders.push({
				// 		totalOrders: totalOrders,
				// 		orderDetails: order,
				// 	});
				// }

				// totalOrders = 0;
				// return res.send({
				// 	message: `Hi ${req.user.firstName}, here is the history of your placed orders.`,
				// 	details: allOrders,
				// });
			})
			.catch(err => console.log(err));
	} catch (err) {
		console.log(err);
	}
};

export const clearCheckoutHistory = (req, res) => {
	try {
		User.findOne({ username: req.user.username })
			.then(user => {
				if (!user.orders.length) {
					return res.send({
						message: `Hi ${req.user.firstName}, the history of your orders is currently empty.`,
					});
				}

				user.orders = [];
				user.save();
			})
			.then(() => {
				res.send({
					message: `Hi ${req.user.firstName}, you've successfully cleared the history of your placed orders.`,
				});
			})
			.catch(err => console.log(err));
	} catch (err) {
		console.log(err);
	}
};
