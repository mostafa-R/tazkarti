import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();


export const transporter = nodemailer.createTransport({
  service: "SendGrid",
  auth: {
    user: "apikey", 
    pass: process.env.SENDGRID_API_KEY,
  },
});