import nodemailer from "nodemailer";

export const sendMail = async (email, subject, template) => {
  try {

    const config = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD,
      },
    });

    await config.verify();
    console.log("SMTP Connected");

    const options = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: subject,
      html: template,
    };

    await config.sendMail(options);

    return true;

  } catch (err) {

    console.log("MAIL ERROR FULL:", err);
    return false;
  }
};