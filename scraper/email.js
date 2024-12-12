import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

export const sendEmail = async (subject, text, availability = false, link = defaultLink) => {

  const recipients = process.env.RECIPIENTS.split(',')
  const mailOptions = {
    from: process.env.EMAIL,
    to: recipients,
    subject: subject,
    html: `
    <h1 style="font-size: 30px; color: ${availability ? 'red' : 'gray'};">${text}</h1>
    <img src="https://cdn.shopify.com/s/files/1/0594/3210/8209/files/LABUBU_240x240.png?v=1647421990" alt="product" />
    <br />
    <a href="${link}" target="_blank">Click here to view the product</a>`
  };


  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

const defaultLink = "https://www.popmart.com/us/products/675/the-monsters-tasty-macarons-vinyl-face-blind-box";