import User from '../models/User.js';
import Product from '../models/Product.js';

export const createOrder = async (req, res) => {
	try {
		await User.findById(req.user.id)
			.then(user => {
				if (user.isAdmin) {
					return res.status(401).send({
						message: `Only non-admin users can create an order.`,
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

				const newOrder = {
					totalAmount: 0,
					totalItems: 0,
					addedOn: '',
					items: [],
				};
				let totalAmount = 0;

				const options = {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				};
				const today = new Date();
				console.log(today.toLocaleDateString('en-US', options)); // Saturday, September 17, 2016
				newOrder.addedOn = today.toLocaleDateString('en-US', options);

				productIds.forEach((productId, index) => {
					Product.findById(productId)
						.then(async product => {
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

							product.quantity -= purchasedQty;

							if (product.quantity > 0) {
								await product.save();
							} else {
								product.isActive = false;
								await product.save();
							}

							const orderedProduct = {
								productId: product._id,
								productName: product.name,
								productPrice: product.price,
								purchasedQty: purchasedQty,
								remainingQty: product.quantity,
								subTotal: subTotal,
								seller: product.seller,
								customer: req.user.username,
							};

							newOrder.items.push(orderedProduct);
							newOrder.totalAmount = totalAmount;
							newOrder.totalItems = newOrder.items.length;

							if (newOrder.items.length === productIds.length) {
								user.orders.push(newOrder);
								await user.save();

								return res.send({
									message: `Hi ${req.user.firstName}, you created an order successfully.`,
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

				if (!user.orders.length) {
					return res.send({
						message: `Hi ${req.user.firstName}, the history of your orders is currently empty.`,
					});
				}

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
				});
			})
			.catch(err => console.log(err));
	} catch (err) {
		console.log(err);
	}
};

export const getAllOrdersForSeller = (req, res) => {
	try {
		const filteredOrders = [];
		let count = 0;

		User.find()
			.then(users => {
				users.forEach(user => {
					const customer = user.fullName;
					user.orders.forEach(order => {
						const filteredItems = order.items.filter(
							item => item.seller === req.user.username
						);

						const mappedFilteredItems = filteredItems.map(item => {
							return {
								name: item.productName,
								price: item.productPrice,
								purchasedQty: item.purchasedQty,
								subTotal: item.subTotal,
							};
						});

						if (filteredItems.length !== 0) {
							const subTotals = filteredItems.map(item => item.subTotal);
							const totalAmount = subTotals.reduce(
								(acc, currVal) => acc + currVal
							);

							count++;
							filteredOrders.push({
								order: count,
								customer: customer,
								totalAmount: totalAmount,
								items: mappedFilteredItems,
							});
						}
					});
				});
			})
			.then(() => {
				if (!filteredOrders.length) {
					return res.send({
						message: `Hi ${req.user.firstName}, you either currently have no customers who created an order or they cleared their checkout history.`,
					});
				}

				return res.send({
					message: `Hi ${req.user.firstName}, here is the list of orders by your customers.`,
					totalOrders: filteredOrders.length,
					details: filteredOrders,
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

		const allOrders = [];
		let totalCustomers = 0;
		let totalOrders = 0;
		User.find()
			.then(users => {
				users.forEach(user => {
					if (user.orders.length !== 0) {
						totalCustomers++;
					}

					const order = user.orders.map((order, orderIndex) => {
						if (order.length !== 0) {
							totalOrders++;
						}
						return {
							order: orderIndex + 1,
							details: order,
						};
					});

					if (user.orders.length !== 0) {
						allOrders.push({
							customer: user.fullName,
							totalOrders: totalOrders,
							orderDetails: order,
						});
					}

					totalOrders = 0;
				});
			})
			.then(() => {
				res.send({
					message: 'Here is the list of all orders of each customer.',
					totalCustomers: totalCustomers,
					details: allOrders,
				});
			})
			.catch(err => console.log(err));
	} catch (err) {
		console.log(err);
	}
};

export const getMyCustomers = async (req, res) => {
	try {
		let customers = [];
		let customerList = [];

		await User.find()
			.then(users => {
				users.forEach(user => {
					user.orders.forEach(order => {
						const filteredItems = order.items.filter(
							item => item.seller === req.user.username
						);

						customers = filteredItems.map(item => item.customer);

						if (customers[0]) {
							customerList.push(customers[0]);
						}
					});
				});
			})
			.catch(err => console.log(err));

		customerList = [...new Set(customerList)];

		if (!customerList.length) {
			return res.send({
				message: `Hello ${req.user.firstName}, you currently have no customers who created an order.`,
			});
		}

		return res.send({
			message: `Hello ${req.user.firstName}, here is the list of your customers.`,
			customers: customerList,
		});
	} catch (err) {
		console.log(err);
	}
};

export const getOrdersByCustomer = (req, res) => {
	try {
		const filteredOrders = [];
		let count = 0;

		User.findOne({ username: req.params.username })
			.then(user => {
				if (!user) {
					return res.send({
						message: `Hello ${req.user.firstName}, ${req.params.username} is not yet registered.`,
					});
				}

				const customer = user.fullName;
				user.orders.forEach(order => {
					const filteredItems = order.items.filter(
						item => item.seller === req.user.username
					);

					const mappedFilteredItems = filteredItems.map(item => {
						return {
							name: item.productName,
							price: item.productPrice,
							purchasedQty: item.purchasedQty,
							subTotal: item.subTotal,
						};
					});

					if (filteredItems.length !== 0) {
						const subTotals = filteredItems.map(item => item.subTotal);
						const totalAmount = subTotals.reduce(
							(acc, currVal) => acc + currVal
						);

						count++;
						filteredOrders.push({
							order: count,
							customer: customer,
							totalAmount: totalAmount,
							items: mappedFilteredItems,
						});
					}
				});

				return user;
			})
			.then(user => {
				if (!filteredOrders.length) {
					return res.send({
						message: `Hi ${req.user.firstName}, ${user.fullName} has either not ordered yet or cleared the checkout history.`,
					});
				}

				return res.send({
					message: `Hi ${req.user.firstName}, here is the list of orders by your customer ${user.fullName}`,
					totalOrders: filteredOrders.length,
					details: filteredOrders,
				});
			})
			.catch(err => console.log(err));
	} catch (err) {
		console.log(err);
	}
};
