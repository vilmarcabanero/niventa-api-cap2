import nodemailer from 'nodemailer';

const sendEmail = options => {
	const transporter = nodemailer.createTransport({
		service: process.env.EMAIL_SERVICE,
		auth: {
			user: process.env.EMAIL_FROM,
			pass: process.env.EMAIL_PASSWORD,
		},
		tls: {
			rejectUnauthorized: false,
		},
	});

	const mailOptions = {
		from: process.env.EMAIL_FROM,
		to: options.to,
		subject: options.subject,
		html: options.text,
	};

	transporter.sendMail(mailOptions, (err, info) => {
		if (err) {
			console.log('Error: ', chalk.bold.red(err.message));
		} else {
			console.log(chalk.bold.green('Email sent!'), info);
		}
	});
};

export default sendEmail;
