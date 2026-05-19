import nodemailer from "nodemailer";

export const sendMail = async (email, subject, template) => {
    try {

        console.log("EMAIL USER:", process.env.SENDER_EMAIL);
        console.log("EMAIL PASS:", process.env.SENDER_PASSWORD);

        const config = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SENDER_EMAIL,
                pass: process.env.SENDER_PASSWORD
            }
        });

        const options = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject,
            html: template
        };

        const info = await config.sendMail(options);

        console.log("MAIL SENT:", info.response);

        return true;

    } catch (err) {

        console.log("MAIL ERROR FULL:", err);

        return false;
    }
};