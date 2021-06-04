import User from '../models/User.js';
// import Order from '../models/Order.js';

export const createOrder = (req, res) => {
	try {
		User.findById(req.user.id)
			.then(foundUser => {
				console.log(foundUser.isAdmin, 'is Admin');
				if (foundUser.isAdmin) {
					return res.status(401).send({
						message: `Only non-admin users can create an order.`,
					});
				}

				// console.log(foundUser.fullName)
				// return res.send('You have created an order successfully.');

				const foundProduct = {
					price: 50,
					purchaseQty: 3,
					_id: '123456789',
				};

				const itemPrice = foundProduct.price;

				const purchasedQty = foundProduct.purchaseQty;

				const subTotal = itemPrice * purchasedQty;

				const totalAmount = subTotal * 5;

				const newOrder = {
					totalAmount: totalAmount,
					userId: foundUser._id,
					items: [
						{
							productId: foundProduct._id,
							subTotal: subTotal,
							purchasedQty: purchasedQty,
						},
					],
				};

				foundUser.orders.push(newOrder);
				console.log(foundUser);
				return foundUser.save();
			})
			// .then(user => {
			// 	console.log(`Enrolled user: ${user.fullName}`);
			// 	return Course.findById(req.body.courseId);
			// })
			// .then(course => {
			// 	console.log(`Course enrolled: ${course.name}`);
			// 	course.enrollees.push({ userId: req.user.id });
			// 	return course.save();
			// })
			// .then(course => {
			// 	res.send(course);
			// })
			.catch(err => {
				console.log(err);
			});
	} catch (err) {
		console.log(err);
	}
};
