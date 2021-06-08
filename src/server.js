import express from 'express';
import connectDB from './config/db.js';
import env from 'dotenv';
import cors from 'cors';
import nodemailer from 'nodemailer';

import authRoutes from './routes/auth.js';
import adminAuthRoutes from './routes/admin/auth.js';
import productRoutes from './routes/product.js';
import orderRoutes from './routes/order.js';
import cartRoutes from './routes/cart.js';

const app = express();
env.config();
connectDB();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/auth/admin', adminAuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/carts', cartRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});
