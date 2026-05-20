require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('=== EMAIL MODULE LOADED (NODEMAILER) ===');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  }
});
console.log('✅ NodeMailer ready');

const sendOrderEmail = async (orderDetails) => {
  try {
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'reverserituals@gmail.com';
    console.log('📧 Sending order confirmation for:', orderDetails.orderId);
    
    const { orderId, customerName, address, items, total, email, phone, altPhone, estimatedDelivery } = orderDetails;

    let deliveryDateStr;
    if (estimatedDelivery) {
      deliveryDateStr = new Date(estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    } else {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 5);
      deliveryDateStr = deliveryDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }

    // Build order items HTML inline
    const orderItemsHtml = items.map(item => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50" valign="top">
                <img src="${item.image || 'https://via.placeholder.com/50x50?text=Product'}" alt="${item.name}" width="50" height="50" style="display:block;border-radius:4px;">
              </td>
              <td valign="top" style="padding-left:10px;font-size:14px;color:#333;">
                ${item.name}<br>
                <span style="color:#666;font-size:12px;">Qty: ${item.qty}</span>
              </td>
              <td align="right" valign="top" style="font-size:14px;color:#333;font-weight:500;">
                ₹${item.price}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('');

    // Full HTML template inline
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:20px;">
    <tr>
      <td align="center">
        <table width="550" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:20px 25px;background-color:#064e3b;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#ffffff;font-size:20px;font-weight:bold;">Reverse Rituals</td>
                  <td align="right" style="color:#c5a059;font-size:14px;">Order #${orderId}</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Message -->
          <tr>
            <td style="padding:25px 25px 15px;">
              <h2 style="margin:0 0 10px;font-size:18px;color:#333;">Order Confirmed!</h2>
              <p style="margin:0;color:#666;font-size:14px;line-height:1.5;">
                Hi ${customerName}, thank you for your order! We're preparing it with care.
              </p>
            </td>
          </tr>
          <!-- Order Items -->
          <tr>
            <td style="padding:0 25px;">
              <p style="margin:0 0 10px;font-size:14px;font-weight:bold;color:#333;">Order Details</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:4px;">
                ${orderItemsHtml}
              </table>
            </td>
          </tr>
          <!-- Total -->
          <tr>
            <td style="padding:15px 25px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:14px;color:#666;">Subtotal</td>
                  <td align="right" style="font-size:14px;color:#333;">₹${total}</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#666;">Shipping</td>
                  <td align="right" style="font-size:14px;color:#666;">Free</td>
                </tr>
                <tr>
                  <td style="border-top:2px solid #064e3b;padding-top:10px;font-size:16px;font-weight:bold;color:#333;">Total</td>
                  <td align="right" style="border-top:2px solid #064e3b;padding-top:10px;font-size:16px;font-weight:bold;color:#064e3b;">₹${total}</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Delivery -->
          <tr>
            <td style="padding:0 25px 15px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:4px;border:1px solid #bbf7d0;">
                <tr>
                  <td style="padding:15px;">
                    <p style="margin:0;font-size:14px;font-weight:bold;color:#166534;">Estimated Delivery</p>
                    <p style="margin:5px 0 0;font-size:16px;color:#15803d;">${deliveryDateStr}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Address & Phone -->
          <tr>
            <td style="padding:0 25px 20px;">
              <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#333;">Shipping Address</p>
              <p style="margin:0;color:#666;font-size:14px;line-height:1.5;">
                ${customerName}<br>
                ${address}
              </p>
              <p style="margin:10px 0 0;font-size:14px;color:#333;">
                <strong>Phone:</strong> ${phone}${altPhone ? '<br><strong>Alt Phone:</strong> ' + altPhone : ''}
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 25px;background-color:#f5f5f5;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#666;">
                Need help? Contact us at support@reverserituals.com
              </p>
              <p style="margin:0;font-size:11px;color:#999;">
                © ${new Date().getFullYear()} Reverse Rituals. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const mailOptions = {
      from: `"Reverse Rituals" <${process.env.MAIL_USER}>`,
      to: email ? [adminEmail, email].join(', ') : adminEmail,
      subject: `Order Confirmed - #${orderId}`,
      html: html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Order email sent!', result.messageId);
    return true;
  } catch (error) {
    console.log('❌ Order email error:', error.message);
    return false;
  }
};

const sendPasswordResetEmail = async (toEmail, name, otp) => {
  try {
    console.log('📧 Sending password reset to:', toEmail);
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px;">
    <tr>
      <td align="center">
        <table width="450" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;">
          <tr>
            <td style="padding:30px 25px 20px;text-align:center;background-color:#064e3b;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;">Reverse Rituals</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 25px 20px;text-align:center;">
              <div style="width:60px;height:60px;background-color:#fef3c7;border-radius:50%;margin:0 auto 20px;">
                <span style="font-size:30px;line-height:60px;">🔐</span>
              </div>
              <h2 style="margin:0 0 15px;font-size:20px;color:#333;">Reset Your Password</h2>
              <p style="margin:0;color:#666;font-size:14px;line-height:1.5;">
                Hi ${name}, we received a request to reset your password.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 25px 20px;text-align:center;">
              <div style="display:inline-block;background-color:#f5f5f5;padding:15px 30px;border-radius:8px;">
                <span style="font-size:28px;font-weight:bold;letter-spacing:8px;color:#333;">${otp}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 25px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef3c7;border-radius:4px;">
                <tr>
                  <td style="padding:15px;text-align:center;">
                    <p style="margin:0;font-size:13px;color:#92400e;">
                      <strong>This code expires in 10 minutes.</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 25px 30px;text-align:center;">
              <p style="margin:0;color:#999;font-size:12px;">
                If you didn't request this, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const mailOptions = {
      from: `"Reverse Rituals" <${process.env.MAIL_USER}>`,
      to: toEmail,
      subject: 'Reset Your Password - OTP',
      html: html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent!', result.messageId);
    return true;
  } catch (error) {
    console.log('❌ Password reset email error:', error.message);
    return false;
  }
};

const sendEmail = async (toEmail, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"Reverse Rituals" <${process.env.MAIL_USER}>`,
      to: toEmail,
      subject: subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', toEmail);
    return true;
  } catch (error) {
    console.log('❌ Email error:', error.message);
    return false;
  }
};

module.exports = { sendOrderEmail, sendEmail, sendPasswordResetEmail };
