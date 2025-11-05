// utils/mailer.js
const { ApiClient, TransactionalEmailsApi, SendSmtpEmail } = require('@getbrevo/brevo');

// 1. Get the default API client instance
// We use the imported ApiClient directly
const defaultClient = ApiClient.instance;

// 2. Configure the 'api-key' authentication
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// 3. Now, create an instance of the API
// We use the imported TransactionalEmailsApi directly
const apiInstance = new TransactionalEmailsApi();

// 4. Create a reusable email-sending function
const sendWelcomeEmail = async (toEmail, studentName, rollNo, tempPassword) => {

    // 5. Create the email object
    // We use the imported SendSmtpEmail directly
    const sendSmtpEmail = new SendSmtpEmail();

    sendSmtpEmail.subject = "Your New Hostel Account Details";
    sendSmtpEmail.htmlContent = `
        <p>Hello ${studentName},</p>
        <p>An account has been created for you in the hostel management portal.</p>
        <p>Please use the following credentials to log in. You will be asked to change your password after your first login.</p>
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