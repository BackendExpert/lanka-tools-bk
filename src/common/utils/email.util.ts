import nodemailer, { Transporter } from "nodemailer";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.configService.get<string>("EMAIL_USER"),
        pass: this.configService.get<string>("EMAIL_PASSWORD")
      },
    });
  }

  async sendOTP(
    email: string,
    otp: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const projectName = this.configService.get<string>("PROJECT_NAME");

    await this.transporter.sendMail({
      from: `"${projectName}" <${this.configService.get<string>("EMAIL_USER")}>`,
      to: email,
      subject: `${projectName} - Password Reset Request`,
      text: `Your verification OTP is ${otp}. It expires in 10 minutes. IP: ${ipAddress}, Device: ${userAgent}`,

      html: `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verification Code</title>
</head>

<body style="margin:0;padding:0;background:#eef2f7;font-family:Segoe UI,Arial,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:40px 15px;">
<tr>
<td align="center">

<table role="presentation" cellpadding="0" cellspacing="0" width="650" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 15px 45px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#1d4ed8,#2563eb,#4f46e5);padding:45px;text-align:center;">


<h1 style="margin:20px 0 8px;color:#ffffff;font-size:32px;font-weight:700;">
${projectName}
</h1>

<p style="margin:0;color:#dbeafe;font-size:16px;">
AI-Powered University Learning Platform
</p>

</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:50px 45px;">

<h2 style="margin:0;color:#111827;font-size:28px;">
Verify Your Login
</h2>

<p style="margin-top:18px;color:#4b5563;font-size:16px;line-height:30px;">
Hello,
</p>

<p style="margin-top:0;color:#4b5563;font-size:16px;line-height:30px;">
A sign-in request was received for your
<strong>${projectName}</strong> account.
To continue securely, enter the verification code below.
</p>

<!-- OTP -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<div style="
display:inline-block;
margin:35px 0;
padding:22px 40px;
background:#f8fafc;
border:2px dashed #2563eb;
border-radius:16px;
font-size:42px;
font-weight:700;
letter-spacing:14px;
color:#1d4ed8;
font-family:Consolas,Courier New,monospace;
">
${otp}
</div>

</td>
</tr>
</table>

<p style="margin:0;color:#dc2626;font-size:15px;font-weight:600;text-align:center;">
This verification code expires in 10 minutes.
</p>

<!-- Divider -->
<hr style="border:none;border-top:1px solid #e5e7eb;margin:40px 0;">

<!-- Security Box -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:20px;">

<tr>
<td>

<h3 style="margin:0 0 18px;color:#111827;font-size:18px;">
Security Information
</h3>

<table width="100%" cellpadding="8" cellspacing="0">

<tr>
<td style="color:#6b7280;width:140px;">
IP Address
</td>

<td style="color:#111827;font-weight:600;">
${ipAddress || "Unavailable"}
</td>
</tr>

<tr>
<td style="color:#6b7280;">
Device
</td>

<td style="color:#111827;font-weight:600;">
${userAgent || "Unavailable"}
</td>
</tr>

<tr>
<td style="color:#6b7280;">
Time
</td>

<td style="color:#111827;font-weight:600;">
${new Date().toUTCString()}
</td>
</tr>

</table>

</td>
</tr>

</table>

<!-- Notice -->
<div style="margin-top:35px;background:#fff7ed;border-left:5px solid #f59e0b;padding:18px;border-radius:10px;">

<p style="margin:0;color:#92400e;font-size:14px;line-height:24px;">
<strong>Didn't request this code?</strong><br><br>

Someone may have attempted to access your account.
Do not share this verification code with anyone.
If this wasn't you, simply ignore this email and your account will remain secure.
</p>

</div>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#f9fafb;padding:35px;text-align:center;">

<p style="margin:0;font-size:18px;font-weight:600;color:#111827;">
${projectName}
</p>

<p style="margin:12px 0 0;color:#6b7280;font-size:14px;line-height:24px;">
AI-Powered University Assistant<br>
Helping students learn smarter through artificial intelligence.
</p>

<hr style="border:none;border-top:1px solid #e5e7eb;margin:25px 0;">

<p style="margin:0;color:#9ca3af;font-size:13px;line-height:24px;">
This is an automated email. Please do not reply.
</p>

<p style="margin-top:10px;color:#9ca3af;font-size:13px;">
© ${new Date().getFullYear()} ${projectName}. All Rights Reserved.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`,
    });
  }

  async NotificationEmail(
    email: string,
    notification: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const projectName = this.configService.get<string>("PROJECT_NAME");

    await this.transporter.sendMail({
      from: `"${projectName}" <${this.configService.get<string>("EMAIL_USER")}>`,
      to: email,
      subject: `${projectName} - System Notification`,
      text: `${projectName}: ${notification}. IP: ${ipAddress}, Device: ${userAgent}`,
      html: `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notification</title>
</head>

<body style="margin:0;padding:0;background:#eef2f7;font-family:Segoe UI,Arial,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:40px 15px;">
<tr>
<td align="center">

<table role="presentation" width="650" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 15px 45px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed);padding:45px;text-align:center;">



<h1 style="margin:20px 0 8px;color:#ffffff;font-size:32px;font-weight:700;">
${projectName}
</h1>

<p style="margin:0;color:#dbeafe;font-size:16px;">
AI-Powered University Assistant
</p>

</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:45px;">

<div style="display:inline-block;background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:700;padding:8px 18px;border-radius:999px;">
📢 UNIVERSITY NOTIFICATION
</div>

<h2 style="margin:25px 0 12px;color:#111827;font-size:28px;">
Hello,
</h2>

<p style="margin:0;color:#4b5563;font-size:16px;line-height:30px;">
You have received a new notification from
<strong>${projectName}</strong>.
Please review the information below.
</p>

<!-- Notification -->
<div style="margin:35px 0;background:#f8fafc;border:1px solid #dbeafe;border-left:5px solid #2563eb;border-radius:14px;padding:25px;">

<h3 style="margin:0 0 18px;color:#1e3a8a;font-size:20px;">
📬 Notification
</h3>

<p style="margin:0;color:#374151;font-size:16px;line-height:30px;white-space:pre-line;">
${notification}
</p>

</div>

<!-- Information -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:20px;">

<tr>
<td>

<h3 style="margin:0 0 18px;color:#111827;font-size:18px;">
Request Information
</h3>

<table width="100%" cellpadding="8" cellspacing="0">

<tr>
<td style="width:140px;color:#6b7280;">
IP Address
</td>

<td style="color:#111827;font-weight:600;">
${ipAddress || "Unavailable"}
</td>
</tr>

<tr>
<td style="color:#6b7280;">
Device
</td>

<td style="color:#111827;font-weight:600;">
${userAgent || "Unavailable"}
</td>
</tr>

<tr>
<td style="color:#6b7280;">
Date
</td>

<td style="color:#111827;font-weight:600;">
${new Date().toUTCString()}
</td>
</tr>

</table>

</td>
</tr>

</table>

<!-- Notice -->
<div style="margin-top:35px;background:#fffbeb;border-left:5px solid #f59e0b;padding:20px;border-radius:12px;">

<p style="margin:0;color:#92400e;font-size:14px;line-height:26px;">
This notification was automatically generated by the
<strong>${projectName}</strong> platform.

Please do not reply to this email. If you require assistance, contact your university administrator or support team.
</p>

</div>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#f9fafb;padding:35px;text-align:center;">

<p style="margin:0;font-size:20px;font-weight:700;color:#111827;">
${projectName}
</p>

<p style="margin:12px 0 0;color:#6b7280;font-size:14px;line-height:24px;">
AI-Powered University Learning Platform
</p>

<hr style="border:none;border-top:1px solid #e5e7eb;margin:25px 0;">

<p style="margin:0;color:#9ca3af;font-size:13px;line-height:24px;">
This is an automated notification email.
</p>

<p style="margin-top:8px;color:#9ca3af;font-size:13px;">
© ${new Date().getFullYear()} ${projectName}. All Rights Reserved.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
        `,
    });
  }



  async AccountCreateEmail(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const projectName = this.configService.get("PROJECT_NAME");

    await this.transporter.sendMail({
      from: `"${projectName}" <${this.configService.get<string>("EMAIL_USER")}>`,
      to: email,
      subject: `${projectName} - Platform Account Created`,

      text: `
${projectName} Account Created

Your platform account has been created.

Email: ${email}
Temporary Password: ${password}

Please login and change your password immediately.

IP Address: ${ipAddress || "N/A"}
Device: ${userAgent || "N/A"}
        `,

      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="
margin:0;
padding:40px 20px;
background:#f8fafc;
font-family:Inter,Arial,sans-serif;
">

<div style="
max-width:600px;
margin:auto;
background:#ffffff;
border-radius:24px;
overflow:hidden;
box-shadow:0 20px 50px rgba(0,0,0,0.08);
">


<!-- Header -->

<div style="
background:linear-gradient(135deg,#4f46e5,#06b6d4);
padding:45px 30px;
text-align:center;
">

<div style="
width:70px;
height:70px;
margin:auto;
background:rgba(255,255,255,0.2);
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:35px;
color:white;
">
✓
</div>


<h1 style="
margin:20px 0 8px;
color:white;
font-size:28px;
">
${projectName}
</h1>

<p style="
margin:0;
color:#e0f2fe;
font-size:15px;
">
Your platform account is ready
</p>

</div>


<!-- Content -->

<div style="
padding:40px 35px;
">


<h2 style="
margin:0;
color:#111827;
font-size:24px;
">
Welcome to the Platform 🚀
</h2>


<p style="
color:#64748b;
font-size:15px;
line-height:26px;
margin-top:15px;
">
Your administrator has created a new platform account for you.
Use the credentials below to access your account.
</p>



<!-- Credentials -->


<div style="
margin-top:30px;
background:#f8fafc;
border:1px solid #e2e8f0;
border-radius:16px;
padding:25px;
">


<p style="
margin:0;
font-size:12px;
color:#64748b;
text-transform:uppercase;
letter-spacing:1px;
">
Login Email
</p>


<p style="
margin:8px 0 25px;
font-size:17px;
font-weight:600;
color:#0f172a;
">
${email}
</p>



<p style="
margin:0;
font-size:12px;
color:#64748b;
text-transform:uppercase;
letter-spacing:1px;
">
Temporary Password
</p>


<div style="
margin-top:10px;
background:#eef2ff;
border:1px dashed #6366f1;
padding:15px;
border-radius:12px;
text-align:center;
font-size:24px;
font-weight:bold;
letter-spacing:4px;
color:#4338ca;
">
${password}
</div>


</div>




<!-- Security -->

<div style="
margin-top:30px;
background:#fff7ed;
border-left:5px solid #f97316;
padding:20px;
border-radius:12px;
">


<h3 style="
margin:0;
color:#c2410c;
font-size:16px;
">
Security Recommendation
</h3>


<p style="
margin:10px 0 0;
color:#9a3412;
font-size:14px;
line-height:24px;
">
This is a temporary password. Please change your password after your first login to protect your account.
</p>


</div>




<!-- Activity -->

<div style="
margin-top:30px;
background:#f8fafc;
padding:20px;
border-radius:14px;
">


<h3 style="
margin:0 0 15px;
font-size:16px;
color:#111827;
">
Account Creation Details
</h3>


<p style="
margin:8px 0;
font-size:13px;
color:#475569;
">
🌐 IP Address:
<strong>${ipAddress || "N/A"}</strong>
</p>


<p style="
margin:8px 0;
font-size:13px;
color:#475569;
">
💻 Device:
<strong>${userAgent || "N/A"}</strong>
</p>


<p style="
margin:8px 0;
font-size:13px;
color:#475569;
">
🕒 Created:
<strong>${new Date().toLocaleString()}</strong>
</p>


</div>


</div>



<!-- Footer -->


<div style="
background:#0f172a;
padding:25px;
text-align:center;
">


<p style="
margin:0;
color:#cbd5e1;
font-size:13px;
">
© ${new Date().getFullYear()} ${projectName}
</p>


<p style="
margin:8px 0 0;
color:#64748b;
font-size:12px;
">
Automated Account Management Service
</p>


</div>



</div>


</body>
</html>
        `,
    });
  }

  async RentalPaymentSuccessEmail(
    email: string,
    productName: string,
    startDateTime: Date,
    endDateTime: Date,
    hourlyPrice: number,
    dailyPrice: number,
    weeklyPrice: number,
    totalHours: number,
    totalDays: number,
    totalWeeks: number,
    subtotal: number,
    vatRate: number,
    vatAmount: number,
    totalAmount: number,
    paymentIntentId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const projectName = this.configService.get("PROJECT_NAME");

    await this.transporter.sendMail({
      from: `"${projectName}" <${this.configService.get<string>("EMAIL_USER")}>`,
      to: email,
      subject: `${projectName} - Rental Payment Successful`,

      text: `
${projectName} Rental Payment Successful

Your rental payment has been successfully completed.

Product: ${productName}

Rental Period
Start: ${new Date(startDateTime).toLocaleString()}
End: ${new Date(endDateTime).toLocaleString()}

Pricing
Hourly Price: $${Number(hourlyPrice).toFixed(2)}
Daily Price: $${Number(dailyPrice).toFixed(2)}
Weekly Price: $${Number(weeklyPrice).toFixed(2)}

Rental Duration
Total Hours: ${totalHours}
Total Days: ${totalDays}
Total Weeks: ${totalWeeks}

Bill
Subtotal: $${Number(subtotal).toFixed(2)}
VAT (${vatRate}%): $${Number(vatAmount).toFixed(2)}
Final Total: $${Number(totalAmount).toFixed(2)}

Payment Details
Payment Status: Successful
Payment Intent ID: ${paymentIntentId}

IP Address: ${ipAddress || "N/A"}
Device: ${userAgent || "N/A"}

Thank you for using ${projectName}.
        `,

      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="
margin:0;
padding:40px 20px;
background:#f8fafc;
font-family:Inter,Arial,sans-serif;
">

<div style="
max-width:650px;
margin:auto;
background:#ffffff;
border-radius:24px;
overflow:hidden;
box-shadow:0 20px 50px rgba(0,0,0,0.08);
">

<!-- Header -->

<div style="
background:linear-gradient(135deg,#16a34a,#059669);
padding:45px 30px;
text-align:center;
">

<div style="
width:70px;
height:70px;
margin:auto;
background:rgba(255,255,255,0.2);
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:35px;
color:white;
">
✓
</div>

<h1 style="
margin:20px 0 8px;
color:white;
font-size:28px;
">
Payment Successful
</h1>

<p style="
margin:0;
color:#dcfce7;
font-size:15px;
">
Your rental payment has been completed successfully
</p>

</div>

<!-- Content -->

<div style="
padding:40px 35px;
">

<h2 style="
margin:0;
color:#111827;
font-size:24px;
">
Rental Confirmation
</h2>

<p style="
color:#64748b;
font-size:15px;
line-height:26px;
margin-top:15px;
">
Thank you for your payment. Your rental request has been successfully processed.
Please find your rental bill below.
</p>

<!-- Product -->

<div style="
margin-top:30px;
background:#f8fafc;
border:1px solid #e2e8f0;
border-radius:16px;
padding:25px;
">

<p style="
margin:0;
font-size:12px;
color:#64748b;
text-transform:uppercase;
letter-spacing:1px;
">
Rental Product
</p>

<p style="
margin:8px 0 0;
font-size:22px;
font-weight:700;
color:#0f172a;
">
${productName}
</p>

</div>

<!-- Rental Period -->

<div style="
margin-top:20px;
background:#f8fafc;
border:1px solid #e2e8f0;
border-radius:16px;
padding:25px;
">

<h3 style="
margin:0 0 18px;
font-size:17px;
color:#111827;
">
Rental Period
</h3>

<p style="
margin:8px 0;
font-size:14px;
color:#475569;
">
Start Date & Time:
<strong>
${new Date(startDateTime).toLocaleString()}
</strong>
</p>

<p style="
margin:8px 0;
font-size:14px;
color:#475569;
">
End Date & Time:
<strong>
${new Date(endDateTime).toLocaleString()}
</strong>
</p>

</div>

<!-- Pricing -->

<div style="
margin-top:20px;
background:#f8fafc;
border:1px solid #e2e8f0;
border-radius:16px;
padding:25px;
">

<h3 style="
margin:0 0 18px;
font-size:17px;
color:#111827;
">
Pricing
</h3>

<table style="
width:100%;
border-collapse:collapse;
">

<tr>
<td style="
padding:8px 0;
font-size:14px;
color:#64748b;
">
Hourly Price
</td>

<td style="
padding:8px 0;
font-size:14px;
font-weight:600;
color:#0f172a;
text-align:right;
">
$${Number(hourlyPrice).toFixed(2)}
</td>
</tr>

<tr>
<td style="
padding:8px 0;
font-size:14px;
color:#64748b;
">
Daily Price
</td>

<td style="
padding:8px 0;
font-size:14px;
font-weight:600;
color:#0f172a;
text-align:right;
">
$${Number(dailyPrice).toFixed(2)}
</td>
</tr>

<tr>
<td style="
padding:8px 0;
font-size:14px;
color:#64748b;
">
Weekly Price
</td>

<td style="
padding:8px 0;
font-size:14px;
font-weight:600;
color:#0f172a;
text-align:right;
">
$${Number(weeklyPrice).toFixed(2)}
</td>
</tr>

</table>

</div>

<!-- Duration -->

<div style="
margin-top:20px;
background:#f8fafc;
border:1px solid #e2e8f0;
border-radius:16px;
padding:25px;
">

<h3 style="
margin:0 0 18px;
font-size:17px;
color:#111827;
">
Rental Duration
</h3>

<table style="
width:100%;
border-collapse:collapse;
">

<tr>
<td style="
padding:8px 0;
font-size:14px;
color:#64748b;
">
Total Hours
</td>

<td style="
padding:8px 0;
font-size:14px;
font-weight:600;
color:#0f172a;
text-align:right;
">
${totalHours}
</td>
</tr>

<tr>
<td style="
padding:8px 0;
font-size:14px;
color:#64748b;
">
Total Days
</td>

<td style="
padding:8px 0;
font-size:14px;
font-weight:600;
color:#0f172a;
text-align:right;
">
${totalDays}
</td>
</tr>

<tr>
<td style="
padding:8px 0;
font-size:14px;
color:#64748b;
">
Total Weeks
</td>

<td style="
padding:8px 0;
font-size:14px;
font-weight:600;
color:#0f172a;
text-align:right;
">
${totalWeeks}
</td>
</tr>

</table>

</div>

<!-- Bill -->

<div style="
margin-top:25px;
background:#ffffff;
border:2px solid #e2e8f0;
border-radius:16px;
padding:25px;
">

<h3 style="
margin:0 0 20px;
font-size:20px;
color:#111827;
">
Rental Bill
</h3>

<table style="
width:100%;
border-collapse:collapse;
">

<tr>
<td style="
padding:10px 0;
font-size:14px;
color:#64748b;
">
Subtotal
</td>

<td style="
padding:10px 0;
font-size:14px;
font-weight:600;
color:#0f172a;
text-align:right;
">
$${Number(subtotal).toFixed(2)}
</td>
</tr>

<tr>
<td style="
padding:10px 0;
font-size:14px;
color:#64748b;
">
VAT (${vatRate}%)
</td>

<td style="
padding:10px 0;
font-size:14px;
font-weight:600;
color:#0f172a;
text-align:right;
">
$${Number(vatAmount).toFixed(2)}
</td>
</tr>

<tr>
<td colspan="2" style="
border-top:2px solid #e2e8f0;
padding-top:18px;
"></td>
</tr>

<tr>
<td style="
font-size:18px;
font-weight:700;
color:#111827;
">
Final Total
</td>

<td style="
font-size:24px;
font-weight:800;
color:#16a34a;
text-align:right;
">
$${Number(totalAmount).toFixed(2)}
</td>
</tr>

</table>

</div>

<!-- Payment -->

<div style="
margin-top:25px;
background:#f0fdf4;
border-left:5px solid #16a34a;
padding:20px;
border-radius:12px;
">

<h3 style="
margin:0;
color:#166534;
font-size:16px;
">
Payment Details
</h3>

<p style="
margin:10px 0 0;
color:#166534;
font-size:14px;
line-height:24px;
">
Payment Status:
<strong>Successful</strong>
</p>

<p style="
margin:5px 0 0;
color:#166534;
font-size:13px;
line-height:22px;
word-break:break-all;
">
Payment ID:
<strong>${paymentIntentId}</strong>
</p>

</div>

<!-- Activity -->

<div style="
margin-top:25px;
background:#f8fafc;
padding:20px;
border-radius:14px;
">

<h3 style="
margin:0 0 15px;
font-size:16px;
color:#111827;
">
Payment Activity
</h3>

<p style="
margin:8px 0;
font-size:13px;
color:#475569;
">
IP Address:
<strong>${ipAddress || "N/A"}</strong>
</p>

<p style="
margin:8px 0;
font-size:13px;
color:#475569;
">
Device:
<strong>${userAgent || "N/A"}</strong>
</p>

<p style="
margin:8px 0;
font-size:13px;
color:#475569;
">
Payment Date:
<strong>${new Date().toLocaleString()}</strong>
</p>

</div>

</div>

<!-- Footer -->

<div style="
background:#0f172a;
padding:25px;
text-align:center;
">

<p style="
margin:0;
color:#cbd5e1;
font-size:13px;
">
© ${new Date().getFullYear()} ${projectName}
</p>

<p style="
margin:8px 0 0;
color:#64748b;
font-size:12px;
">
Automated Rental Payment Service
</p>

</div>

</div>

</body>
</html>
        `,
    });
  }


  async RentalOverDueEmail(
    email: string,
    productName: string,
    overdueDays: number,
    overduePercentage: number,
    overdueCost: number,
    totalCost: number,
  ): Promise<void> {
    const projectName = this.configService.get("PROJECT_NAME");

    await this.transporter.sendMail({
      from: `"${projectName}" <${this.configService.get<string>("EMAIL_USER")}>`,
      to: email,
      subject: `${projectName} - Rental Overdue Notice`,

      text: `
${projectName} Rental Overdue Notice

Your rental period has expired and the rented product has not yet been returned.

Product: ${productName}
Overdue Days: ${overdueDays}
Overdue Charge: ${overduePercentage}%
Overdue Cost: $${overdueCost.toFixed(2)}
Total Rental Cost: $${totalCost.toFixed(2)}

Please return the rented product as soon as possible to avoid additional overdue charges.

Thank you,
${projectName}
        `,

      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="
margin:0;
padding:40px 20px;
background:#f8fafc;
font-family:Inter,Arial,sans-serif;
">

<div style="
max-width:600px;
margin:auto;
background:#ffffff;
border-radius:24px;
overflow:hidden;
box-shadow:0 20px 50px rgba(0,0,0,0.08);
">

<div style="
background:linear-gradient(135deg,#dc2626,#f97316);
padding:45px 30px;
text-align:center;
">

<div style="
width:70px;
height:70px;
margin:auto;
background:rgba(255,255,255,0.2);
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:35px;
color:white;
">
!
</div>

<h1 style="
margin:20px 0 8px;
color:white;
font-size:28px;
">
${projectName}
</h1>

<p style="
margin:0;
color:#fee2e2;
font-size:15px;
">
Rental Overdue Notice
</p>

</div>

<div style="
padding:40px 35px;
">

<h2 style="
margin:0;
color:#111827;
font-size:24px;
">
Your Rental Is Overdue
</h2>

<p style="
color:#64748b;
font-size:15px;
line-height:26px;
margin-top:15px;
">
The rental period for the product below has expired, and our records indicate that the product has not yet been returned.
</p>

<div style="
margin-top:30px;
background:#f8fafc;
border:1px solid #e2e8f0;
border-radius:16px;
padding:25px;
">

<p style="
margin:0;
font-size:12px;
color:#64748b;
text-transform:uppercase;
letter-spacing:1px;
">
Rented Product
</p>

<p style="
margin:8px 0 25px;
font-size:20px;
font-weight:700;
color:#0f172a;
">
${productName}
</p>

<p style="
margin:0;
font-size:12px;
color:#64748b;
text-transform:uppercase;
letter-spacing:1px;
">
Overdue Duration
</p>

<p style="
margin:8px 0 0;
font-size:18px;
font-weight:700;
color:#dc2626;
">
${overdueDays} day${overdueDays === 1 ? "" : "s"}
</p>

</div>

<div style="
margin-top:25px;
display:flex;
gap:10px;
">

<div style="
flex:1;
background:#fff7ed;
border:1px solid #fed7aa;
border-radius:14px;
padding:20px;
">

<p style="
margin:0;
font-size:11px;
color:#9a3412;
text-transform:uppercase;
letter-spacing:1px;
">
Overdue Rate
</p>

<p style="
margin:8px 0 0;
font-size:22px;
font-weight:800;
color:#c2410c;
">
${overduePercentage}%
</p>

</div>

<div style="
flex:1;
background:#fef2f2;
border:1px solid #fecaca;
border-radius:14px;
padding:20px;
">

<p style="
margin:0;
font-size:11px;
color:#991b1b;
text-transform:uppercase;
letter-spacing:1px;
">
Overdue Cost
</p>

<p style="
margin:8px 0 0;
font-size:22px;
font-weight:800;
color:#dc2626;
">
$${overdueCost.toFixed(2)}
</p>

</div>

</div>

<div style="
margin-top:30px;
background:#fff7ed;
border-left:5px solid #f97316;
padding:20px;
border-radius:12px;
">

<h3 style="
margin:0;
color:#c2410c;
font-size:16px;
">
Action Required
</h3>

<p style="
margin:10px 0 0;
color:#9a3412;
font-size:14px;
line-height:24px;
">
Please return the rented product as soon as possible. Additional overdue charges may apply for each day the product remains unreturned.
</p>

</div>

<div style="
margin-top:30px;
background:#f8fafc;
padding:25px;
border-radius:14px;
">

<h3 style="
margin:0 0 15px;
font-size:16px;
color:#111827;
">
Rental Cost Summary
</h3>

<p style="
margin:10px 0;
font-size:14px;
color:#475569;
">
Overdue Days:
<strong style="color:#0f172a;">
${overdueDays}
</strong>
</p>

<p style="
margin:10px 0;
font-size:14px;
color:#475569;
">
Overdue Charge:
<strong style="color:#dc2626;">
$${overdueCost.toFixed(2)}
</strong>
</p>

<p style="
margin:15px 0 0;
padding-top:15px;
border-top:1px solid #e2e8f0;
font-size:16px;
color:#334155;
">
Total Cost:
<strong style="
float:right;
color:#0f172a;
font-size:20px;
">
$${totalCost.toFixed(2)}
</strong>
</p>

</div>

</div>

<div style="
background:#0f172a;
padding:25px;
text-align:center;
">

<p style="
margin:0;
color:#cbd5e1;
font-size:13px;
">
© ${new Date().getFullYear()} ${projectName}
</p>

<p style="
margin:8px 0 0;
color:#64748b;
font-size:12px;
">
Automated Rental Management Service
</p>

</div>

</div>

</body>
</html>
        `,
    });
  }

  async RentalOverduePaymentRequestEmail(
    email: string,
    productName: string,
    overdueDays: number,
    overdueCost: number,
    totalCost: number,
  ) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Overdue Rental Payment Request",
      html: `
            <div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:Arial,sans-serif;">
                <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
                    <div style="padding:28px;background:#0f172a;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:24px;">Overdue Payment Request</h1>
                    </div>

                    <div style="padding:32px;">
                        <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px;">
                            Rental Overdue
                        </h2>

                        <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.7;">
                            Your rented tool has been returned after the expected return time.
                            An overdue charge has been generated for this rental.
                        </p>

                        <div style="padding:20px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;">
                            <p style="margin:0 0 12px;color:#991b1b;font-size:13px;font-weight:bold;">
                                OVERDUE DETAILS
                            </p>

                            <p style="margin:8px 0;color:#334155;font-size:14px;">
                                <strong>Product:</strong> ${productName}
                            </p>

                            <p style="margin:8px 0;color:#334155;font-size:14px;">
                                <strong>Overdue Days:</strong> ${overdueDays}
                            </p>

                            <p style="margin:8px 0;color:#334155;font-size:14px;">
                                <strong>Overdue Cost:</strong> $${Number(overdueCost).toFixed(2)}
                            </p>
                        </div>

                        <div style="margin-top:24px;padding:20px;background:#f8fafc;border-radius:12px;">
                            <div style="display:flex;justify-content:space-between;">
                                <span style="color:#64748b;font-size:14px;">
                                    Amount Due
                                </span>

                                <strong style="color:#dc2626;font-size:24px;">
                                    $${Number(overdueCost).toFixed(2)}
                                </strong>
                            </div>
                        </div>

                        <p style="margin:24px 0 0;color:#64748b;font-size:14px;line-height:1.7;">
                            Please complete the overdue payment to settle your rental account.
                        </p>


                        <p style="margin:28px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">
                            If you have already paid this amount, please ignore this email.
                        </p>
                    </div>

                    <div style="padding:20px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                        <p style="margin:0;color:#94a3b8;font-size:12px;">
                            This is an automated notification. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </div>
        `,
    });
  }
}

