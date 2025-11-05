// utils/mailer.js
const Brevo = require('@getbrevo/brevo');

// 1. Create an instance of the API
const apiInstance = new Brevo.TransactionalEmailsApi();

// 2. Set the API key *directly* on the instance's authenticator.
apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

// 3. Create a reusable email-sending function
const sendWelcomeEmail = async (toEmail, studentName, rollNo, tempPassword) => {

    // 4. Create the email object
    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Your New Hostel Account Details";

    // --- IMPORTANT: REPLACE THIS URL WITH YOUR LIVE FRONTEND URL ---
    const frontendLoginUrl = 'https://hostelmanagementsystem-rho.vercel.app/'; // Or your deployed URL

    // 5. Updated & Beautified HTML Content
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #004a99; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Welcome to the Hostel Portal!</h1>
            </div>
            <div style="padding: 30px;">
                <p style="font-size: 16px; color: #333;">Hello ${studentName},</p>
                <p style="font-size: 16px; color: #333;">
                    An account has been successfully created for you. You can now log in to the portal to manage your profile, view announcements, and submit requests.
                </p>
                
                <p style="font-size: 16px; color: #333;">Please use these credentials for your first login:</p>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 25px 0; text-align: center; font-size: 18px;">
                    <strong style="color: #555;">Username (Roll No):</strong>
                    <span style="color: #000; font-weight: bold; display: block; margin-top: 5px;">${rollNo}</span>
                    <br>
                    <strong style="color: #555;">Temporary Password:</strong>
                    <span style="color: #000; font-weight: bold; display: block; margin-top: 5px;">${tempPassword}</span>
                </div>

                <a href="${frontendLoginUrl}" style="display: block; width: 200px; margin: 25px auto; padding: 14px 20px; font-size: 16px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px; text-align: center;">
                    Log In to Your Account
                </a>
                
                <p style="font-size: 14px; color: #555; text-align: center; margin-top: 20px;">
                    <strong>Important:</strong> For your security, please change your password immediately after logging in. You can do this by navigating to your <strong>Profile</strong> section and clicking the <strong>"Change Password"</strong> button.
                </p>
            </div>
            <div style="background-color: #f4f4f4; color: #888; padding: 20px; text-align: center; font-size: 12px;">
                <p>Hostel Administration</p>
            </div>
        </div>
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