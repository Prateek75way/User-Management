import transporter from "./../node-mailer/config"; // Replace with the actual path

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender's email address
      to, // Recipient's email address
      subject, // Email subject
      html, // Email body (HTML format)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}; 

export default sendEmail;
