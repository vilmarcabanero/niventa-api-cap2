import User from '../models/User.js';
import Product from '../models/Product.js';

export const checkout = async (req, res) => {
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

				let includes = false;
				let cartNope = {};
				let productIdCart = [];

				// console.log(user.orders);

				user.orders.forEach(cart => {
					cartNope = cart;
					// console.log(cart);
					cart.items.forEach(item => {
						productIdCart.push(item.productId);
					});

					productIds.forEach((productId, productIdIndex) => {
						if (productIdCart.includes(productId)) {
							// console.log(productId, true, productIdIndex + 1);
							includes = true;
						}
					});
				});

				// console.log(cartNope);

				productIdCart = [...new Set(productIdCart)];
				console.log(productIdCart);

				return res.send(includes);

				console.log(productIds.length);

				const productPurchasedQties = foundProductIds.map(item => {
					return item.purchasedQty;
				});

				const newOrder = {
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
							newOrder.totalItems = newOrder.items.length;

							product.quantity -= purchasedQty;

							if (product.quantity > 0) {
								await product.save();
							} else {
								product.isActive = false;
								await product.save();
							}

							if (index === productIds.length - 1) {
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

export const addToCart = async (req, res) => {
	try {
		await User.findById(req.user.id)
			.then(user => {
				if (user.isAdmin) {
					return res.status(401).send({
						message: `Only non-admin users can create an order.`,
					});
				}

				if (user.carts.length) {
					return res.status(400).send({
						message: `Your cart is not empty, please proceed to your cart to remove or add items.`,
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

							product.quantity -= purchasedQty;

							if (product.quantity > 0) {
								await product.save();
							} else {
								product.isActive = false;
								await product.save();
							}

							const addedProduct = {
								productId: product._id,
								productName: product.name,
								productPrice: product.price,
								purchasedQty: purchasedQty,
								remainingQty: product.quantity,
								subTotal: subTotal,
								seller: product.seller,
								customer: req.user.username,
							};

							newCart.items.push(addedProduct);
							newCart.totalAmount = totalAmount;
							newCart.totalItems = newCart.items.length;

							if (index === productIds.length - 1) {
								user.carts.push(newCart);
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

export const updateCart = async (req, res) => {
	try {
		await User.findById(req.user.id)
			.then(user => {
				if (user.isAdmin) {
					return res.status(401).send({
						message: `Only non-admin users can create an order.`,
					});
				}

				if (!user.orders.length) {
					return res.status(400).send({
						message: `Your cart is empty, please proceed to add to cart route to add new items.`,
					});
				}

				if (user.orders.length) {
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
						message: `Your cart is empty, please proceed to add to cart route to add new items.`,
					});
				}

        //Kunin muna ang remaining quantity, i.add ang remaining quantity plus the purchased quantity at yun ang original quantity, ilagay or i.update ang product.quantity sa value ng original quantity.

        user.carts.forEach(cart => {
          cart.items.forEach(item => {
            console.log(item)
          })
        })

        return 

				user.carts = [];
				await user.save();

				if (!user.carts.length) {
					return res.send({
						message: 'Successfully removed all items of your cart.',
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

				console.log(user.cartItems);

				const cartSummary = user.carts.map((cart, index) => {
					const totalAmount = cart.totalAmount;

					const item = cart.items.map((item, index) => {
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

				const itemTotal = cartSummary.length;

				if (!itemTotal) {
					return res.status(400).send({
						message: `Your cart is empty, please proceed to add to cart route to add new items.`,
					});
				}

				// console.log(orderSummary);

				const details = {
					totalItems: itemTotal,
					details: cartSummary,
				};

				return res.send({
					message: `Hello ${req.user.firstName}, here is the list of items on our cart.`,
					summary: details,
				});
			})
			.catch(err => console.log(err));
	} catch (err) {
		console.log(err);
	}
};
