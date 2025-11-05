const nodemailer = require('nodemailer');

// 1. Configure the transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 2. Create a reusable email-sending function
const sendWelcomeEmail = async (toEmail, studentName, rollNo, tempPassword) => {
    const mailOptions = {
        from: `"Hostel Management" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Your New Hostel Account Details',
        html: `
            <p>Hello ${studentName},</p>
            <p>An account has been created for you in the hostel management portal.</p>
            <p>Please use the following credentials to log in. You can change your password after your first login in the profile section.</p>
            <ul>
                <li><strong>Username (Roll No):</strong> ${rollNo}</li>
                <li><strong>Temporary Password:</strong> ${tempPassword}</li>
            </ul>
            <p>Thank you,</p>
            <p>Hostel Administration</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent to:', toEmail);
    } catch (error) {
        console.error('Error sending email:', error);
        // We throw the error so the transaction can be rolled back
        throw new Error('Failed to send welcome email.');
    }
};

module.exports = { sendWelcomeEmail };