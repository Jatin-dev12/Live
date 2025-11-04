const nodemailer = require('nodemailer');
const { getSmtpConfig } = require('./siteSettings');

/**
 * Create email transporter using SMTP settings from database
 */
async function createTransporter() {
    const smtpConfig = await getSmtpConfig();
    
    if (!smtpConfig.host || !smtpConfig.username || !smtpConfig.password) {
        throw new Error('SMTP configuration is incomplete. Please configure SMTP settings in Site Settings.');
    }
    
    return nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port || 587,
        secure: smtpConfig.secure || false,
        auth: {
            user: smtpConfig.username,
            pass: smtpConfig.password
        }
    });
}

/**
 * Send email using configured SMTP settings
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
async function sendEmail({ to, subject, text, html }) {
    try {
        const transporter = await createTransporter();
        const smtpConfig = await getSmtpConfig();
        
        const mailOptions = {
            from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
            to,
            subject,
            text,
            html
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Test SMTP connection
 */
async function testSmtpConnection() {
    try {
        const transporter = await createTransporter();
        await transporter.verify();
        return { success: true, message: 'SMTP connection successful' };
    } catch (error) {
        console.error('SMTP connection test failed:', error);
        return { success: false, message: error.message };
    }
}

module.exports = {
    sendEmail,
    testSmtpConnection
};
