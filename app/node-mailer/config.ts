import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
   // Use true if the port is 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
}); 



export default transporter;
 