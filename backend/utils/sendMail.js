import nodemailer from "nodemailer";

export const sendMail = async (email, subject, template) => {
  try {

  const config = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
});
 console.log("SENDER_EMAIL:", process.env.SENDER_EMAIL);
console.log(
  "SENDER_PASSWORD:",
  process.env.SENDER_PASSWORD ? "FOUND" : "MISSING"
);

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