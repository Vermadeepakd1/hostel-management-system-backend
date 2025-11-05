// utils/mailer.js
const Brevo = require('@getbrevo/brevo');

// --- THIS IS THE CORRECTED AUTHENTICATION ---
// 1. Get the default API client instance
const defaultClient = Brevo.ApiClient.instance;

// 2. Configure the 'api-key' authentication
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
// ---------------------------------------------

// 3. Now, create an instance of the API
const apiInstance = new Brevo.TransactionalEmailsApi();

// 4. Create a reusable email-sending function
const sendWelcomeEmail = async (toEmail, studentName, rollNo, tempPassword) => {

    // 5. Create the email object
    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Your New Hostel Account Details";
    sendSmtpEmail.htmlContent = `
        <p>Hello ${studentName},</p>
        <p>An account has been created for you in the hostel management portal.</p>
        <p>Please use the following credentials to log in. You can change your password through profile section after your first login.</p>
        <ul>
            <li><strong>Username (Roll No):</strong> ${rollNo}</li>
            <li><strong>Temporary Password:</strong> ${tempPassword}</li>
        </ul>
        <p>Thank you,</p>
        <p>Hostel Administration</p>
    `;
    sendSmtpEmail.sender = {
        name: "Hostel Administration",
        email: process.env.SENDER_EMAIL
    };
    sendSmtpEmail.to = [
        { email: toEmail, name: studentName }
    ];

    try {
        // 6. Send the email
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Welcome email sent via Brevo to:', toEmail);
    } catch (error) {
        console.error('Error sending email via Brevo:', error.toString());
        // Throw an error so the route can catch it
        throw new Error('Failed to send welcome email.');
    }
};

module.exports = { sendWelcomeEmail };