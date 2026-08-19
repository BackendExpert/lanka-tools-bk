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

<div style="width:80px;height:80px;border-radius:20px;background:rgba(255,255,255,0.15);display:inline-block;line-height:80px;font-size:42px;">
🎓
</div>

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

<div style="width:80px;height:80px;border-radius:20px;background:rgba(255,255,255,.15);display:inline-block;line-height:80px;font-size:42px;">
🎓
</div>

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
}

