/**
 * Site Settings Usage Examples
 * 
 * This file demonstrates how to use the Site Settings module
 * in your application code.
 */

// ============================================
// Example 1: Get All Settings
// ============================================
const { getSiteSettings } = require('../utils/siteSettings');

async function example1() {
    const settings = await getSiteSettings();
    console.log('Site Name:', settings.siteName);
    console.log('Contact Email:', settings.contactEmail);
    console.log('Facebook:', settings.socialMedia.facebook);
}

// ============================================
// Example 2: Get Only Social Media Links
// ============================================
const { getSocialMediaLinks } = require('../utils/siteSettings');

async function example2() {
    const socialLinks = await getSocialMediaLinks();

    // Build social media menu
    const socialMenu = [];
    if (socialLinks.facebook) socialMenu.push({ name: 'Facebook', url: socialLinks.facebook });
    if (socialLinks.twitter) socialMenu.push({ name: 'Twitter', url: socialLinks.twitter });
    if (socialLinks.instagram) socialMenu.push({ name: 'Instagram', url: socialLinks.instagram });

    return socialMenu;
}

// ============================================
// Example 3: Send Welcome Email
// ============================================
const { sendEmail } = require('../utils/emailService');

async function sendWelcomeEmail(userEmail, userName) {
    const result = await sendEmail({
        to: userEmail,
        subject: 'Welcome to Our Platform!',
        text: `Hello ${userName}, welcome to our platform!`,
        html: `
            <h1>Welcome ${userName}!</h1>
            <p>Thank you for joining our platform.</p>
            <p>We're excited to have you on board.</p>
        `
    });

    if (result.success) {
        console.log('Welcome email sent successfully');
    } else {
        console.error('Failed to send email:', result.error);
    }
}

// ============================================
// Example 4: Send Password Reset Email
// ============================================
async function sendPasswordResetEmail(userEmail, resetToken) {
    const resetUrl = `https://yoursite.com/reset-password?token=${resetToken}`;

    await sendEmail({
        to: userEmail,
        subject: 'Password Reset Request',
        text: `Click this link to reset your password: ${resetUrl}`,
        html: `
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
            </a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
        `
    });
}

// ============================================
// Example 5: Use in Express Route
// ============================================
const express = require('express');
const router = express.Router();

router.get('/contact', async (req, res) => {
    const settings = await getSiteSettings();

    res.render('contact', {
        title: 'Contact Us',
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        socialLinks: settings.socialMedia
    });
});

// ============================================
// Example 6: Send Contact Form Email
// ============================================
async function handleContactForm(formData) {
    const settings = await getSiteSettings();

    // Send to site admin
    await sendEmail({
        to: settings.contactEmail,
        subject: `New Contact Form Submission from ${formData.name}`,
        html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone}</p>
            <p><strong>Message:</strong></p>
            <p>${formData.message}</p>
        `
    });

    // Send confirmation to user
    await sendEmail({
        to: formData.email,
        subject: 'Thank you for contacting us',
        html: `
            <h2>Thank you for reaching out!</h2>
            <p>Hi ${formData.name},</p>
            <p>We received your message and will get back to you soon.</p>
            <p>Best regards,<br>${settings.siteName}</p>
        `
    });
}

// ============================================
// Example 7: Test SMTP Before Sending
// ============================================
const { testSmtpConnection } = require('../utils/emailService');

async function sendEmailSafely(emailOptions) {
    // Test connection first
    const testResult = await testSmtpConnection();

    if (!testResult.success) {
        console.error('SMTP not configured properly:', testResult.message);
        return { success: false, error: 'Email service not available' };
    }

    // Send email
    return await sendEmail(emailOptions);
}

// ============================================
// Example 8: Use Settings in EJS Template
// ============================================
/*
In your EJS file (settings are automatically available):

<footer>
    <div class="social-links">
        <% if (siteSettings.socialMedia.facebook) { %>
            <a href="<%= siteSettings.socialMedia.facebook %>">
                <i class="ri-facebook-fill"></i>
            </a>
        <% } %>
        
        <% if (siteSettings.socialMedia.twitter) { %>
            <a href="<%= siteSettings.socialMedia.twitter %>">
                <i class="ri-twitter-fill"></i>
            </a>
        <% } %>
    </div>
    
    <p>Contact: <%= siteSettings.contactEmail %></p>
    <p>&copy; <%= new Date().getFullYear() %> <%= siteSettings.siteName %></p>
</footer>
*/

// ============================================
// Example 9: Clear Cache After Manual Update
// ============================================
const { clearCache } = require('../utils/siteSettings');

async function updateSettingsManually() {
    const SiteSettings = require('../models/SiteSettings');

    // Update settings directly in database
    await SiteSettings.findOneAndUpdate(
        {},
        { siteName: 'New Site Name' }
    );

    // Clear cache so next request gets fresh data
    clearCache();
}

// ============================================
// Example 10: Bulk Email Sending
// ============================================
async function sendBulkEmails(recipients, subject, htmlContent) {
    const results = [];

    for (const recipient of recipients) {
        const result = await sendEmail({
            to: recipient.email,
            subject: subject,
            html: htmlContent.replace('{{name}}', recipient.name)
        });

        results.push({
            email: recipient.email,
            success: result.success
        });

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
}

module.exports = {
    example1,
    example2,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    handleContactForm,
    sendEmailSafely,
    sendBulkEmails
};
