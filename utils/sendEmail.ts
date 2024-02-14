import nodemailer from 'nodemailer'

export const sendEmail = async (email:string, subject:string, text:string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SERVICE,
      port: 587,
      secure: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      text: text,
    });
  } catch (err) {
    console.log(err);
    console.log("Email not sent!");
  }
};