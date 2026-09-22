const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
async function sendOrderConfirmation(order, toEmail) {
  if (!process.env.SMTP_USER) { console.log("SMTP not configured"); return; }
  const rows = order.items.map(i => "<tr><td>" + i.qty + " x " + i.name + "</td><td align=right>$" + (i.price * i.qty).toFixed(2) + "</td></tr>").join("");
  const html = "<div style='font-family:Arial;max-width:600px;margin:auto;padding:24px;background:#fff8f2;border-radius:12px;'>" +
    "<h1 style='color:#7a1f2b;'>Sweet Deserts</h1><h2>Thank you for your order!</h2>" +
    "<p>Tracking #: <strong>" + (order.trackingNumber || "-") + "</strong></p>" +
    "<table width=100% cellpadding=8 style='background:#fff;'>" + rows +
    "<tr style='border-top:2px solid #7a1f2b;'><td><strong>Total</strong></td><td align=right><strong>$" + order.total.toFixed(2) + "</strong></td></tr></table>" +
    "<p style='color:#a1273a;'>Deliciousness on its way!</p></div>";
  try {
    const info = await transporter.sendMail({ from: process.env.MAIL_FROM, to: toEmail, subject: "Your Sweet Deserts order", html });
    console.log("Email sent:", info.messageId);
  } catch (err) { console.error("Email failed:", err.message); }
}
module.exports = { sendOrderConfirmation };
