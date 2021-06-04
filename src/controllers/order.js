import User from '../models/User.js';
// import Order from '../models/Order.js';

export const createOrder = (req, res) => {
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
					return res
						.status(400)
						.send({
							message: `Not enough stocks. You order ${purchasedQty} pieces but the current stock has ${
								foundProduct.quantity
							} ${foundProduct.quantity === 1 ? 'piece' : 'pieces'}`,
						});
				}
        res.send({message: 'You created an order successfully.'})
				return foundUser.save();
			})
			.catch(err => {
				console.log(err);
			});
	} catch (err) {
		console.log(err);
	}
};
