import nodemailer from "nodemailer";

export const sendMail = async (email, subject, template) => {
  try {

  const config = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_LOGIN,
    pass: process.env.BREVO_PASSWORD,
  },
});
 console.log("BREVO_LOGIN:", process.env.BREVO_LOGIN);
console.log(
  "BREVO_PASSWORD:",
  process.env.BREVO_PASSWORD ? "FOUND" : "MISSING"
);

    await config.verify();
    console.log("SMTP Connected");

    const options = {
      from: process.env.BREVO_LOGIN,
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