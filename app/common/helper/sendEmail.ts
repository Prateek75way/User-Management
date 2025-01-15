
import nodemailer from "nodemailer";
export const sendEmail = async({
    email, 
    sub,
    html,
    url
}: {
    email: string,
    url: string,
    sub: string,
    html: string
}) => {
    try {
        await nodemailer.createTestAccount()
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        })

        let subject: string = sub as string
        

        const mailOptions = {
            from : process.env.MAIL_USER,
            to: email,
            subject,
             html
        }

        await transporter.sendMail(mailOptions)
        return true
    } catch (err) {
        console.log(err);
        return false
        
    }
}