// utils/mailer.js
const Brevo = require('@getbrevo/brevo');

// 1. Create an instance of the API
const apiInstance = new Brevo.TransactionalEmailsApi();

// 2. Set the API key *directly* on the instance's authenticator.
// This is the new, direct method that avoids the 'ApiClient.instance' crash.
apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

// 3. Create a reusable email-sending function
const sendWelcomeEmail = async (toEmail, studentName, rollNo, tempPassword) => {

    // 4. Create the email object
    const sendSmtpEmail = new Brevo.SendSmtpEmail();

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
        // 5. Send the email
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Welcome email sent via Brevo to:', toEmail);
    } catch (error) {
        console.error('Error sending email via Brevo:', error.toString());
        // Throw an error so the route can catch it
        throw new Error('Failed to send welcome email.');
    }
};

module.exports = { sendWelcomeEmail };