'use strict';

const express    = require('express');
const nodemailer = require('nodemailer');
const { getPool } = require('../db');
const cmsStore   = require('../db/cmsStore');
const router     = express.Router();

// ─── Mailer ──────────────────────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransporter({
    host:   process.env.SMTP_HOST || 'smtp.hostinger.com',
    port:   parseInt(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function hasSmtpConfig() {
  return (
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_PASS !== 'your_email_password' &&
    !process.env.SMTP_USER.includes('your_')
  );
}

// ─── Simple sanitize ─────────────────────────────────────────────────────────
function sanitize(str = '') {
  return String(str).replace(/[<>]/g, '').trim().substring(0, 2000);
}

// ─── Contact Form ────────────────────────────────────────────────────────────
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, company, service, message, budget } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email and message are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

      // 1. Save to Database & CMS Store
      try {
        await cmsStore.addSubmission('contact', {
          name: sanitize(name),
          email: sanitize(email),
          phone: sanitize(phone),
          company: sanitize(company),
          service: sanitize(service),
          message: sanitize(message),
          budget: sanitize(budget)
        });

        const pool = getPool();
        if (pool) {
          await pool.query(
            `INSERT INTO contact_submissions (name, email, phone, company, service, message) VALUES (?, ?, ?, ?, ?, ?)`,
            [sanitize(name), sanitize(email), sanitize(phone), sanitize(company), sanitize(service), sanitize(message)]
          );
        }
      } catch (dbErr) {
        console.warn('[DB Contact Log Notice]', dbErr.message);
      }

    // 2. Send Emails (if SMTP is configured)
    if (hasSmtpConfig()) {
      const transporter = createTransporter();

      // Send to Cloutgency team
      await transporter.sendMail({
        from:    `"Cloutgency Website" <${process.env.SMTP_USER}>`,
        to:      process.env.CONTACT_RECEIVER || 'hello@cloutgency.com',
        replyTo: sanitize(email),
        subject: `New Contact: ${sanitize(name)} — ${sanitize(service) || 'General Inquiry'}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#111;color:#f5c300;padding:20px 24px;border-radius:8px 8px 0 0">
              <h2 style="margin:0;font-size:20px">New Contact Form Submission</h2>
            </div>
            <div style="background:#1a1a1a;color:#fff;padding:24px;border-radius:0 0 8px 8px">
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 0;color:#999;width:120px">Name</td><td style="padding:8px 0;color:#fff">${sanitize(name)}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Email</td><td style="padding:8px 0;color:#fff">${sanitize(email)}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Phone</td><td style="padding:8px 0;color:#fff">${sanitize(phone) || '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Company</td><td style="padding:8px 0;color:#fff">${sanitize(company) || '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Service</td><td style="padding:8px 0;color:#f5c300">${sanitize(service) || '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Budget</td><td style="padding:8px 0;color:#fff">${sanitize(budget) || '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#999;vertical-align:top">Message</td><td style="padding:8px 0;color:#fff;line-height:1.6">${sanitize(message).replace(/\n/g, '<br>')}</td></tr>
              </table>
            </div>
          </div>
        `,
      });

      // Auto-reply to sender
      await transporter.sendMail({
        from:    `"Cloutgency" <${process.env.SMTP_USER}>`,
        to:      sanitize(email),
        subject: `We received your message — Cloutgency`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#111;color:#f5c300;padding:20px 24px;border-radius:8px 8px 0 0">
              <h2 style="margin:0;font-size:20px">Thanks for reaching out!</h2>
            </div>
            <div style="background:#1a1a1a;color:#fff;padding:24px;border-radius:0 0 8px 8px;line-height:1.7">
              <p>Hi ${sanitize(name)},</p>
              <p>We've received your message and will get back to you within <strong style="color:#f5c300">24 hours</strong>.</p>
              <p>In the meantime, feel free to check out our work at <a href="https://cloutgency.com/our-works" style="color:#f5c300">cloutgency.com</a>.</p>
              <p style="margin-top:24px">— Team Cloutgency</p>
            </div>
          </div>
        `,
      });
    } else {
      console.log('✦ [Dev Notice] New contact inquiry received (SMTP disabled):', { name, email, service, phone });
    }

    return res.json({ success: true, message: 'Your message has been sent! We\'ll get back to you within 24 hours.' });

  } catch (err) {
    console.error('[Contact Form Error]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to send message. Please try again or email us directly at hello@cloutgency.com' });
  }
});

// ─── Career Application ───────────────────────────────────────────────────────
router.post('/apply', async (req, res) => {
  try {
    const { name, email, phone, role, resume, portfolio, onsite, linkedin, message } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ success: false, error: 'Name, email and role are required.' });
    }

    // 1. Save to Database & CMS Store
    try {
      await cmsStore.addSubmission('careers', {
        name: sanitize(name),
        email: sanitize(email),
        phone: sanitize(phone),
        role: sanitize(role),
        resume: sanitize(resume),
        portfolio: sanitize(portfolio),
        onsite: sanitize(onsite),
        linkedin: sanitize(linkedin),
        message: sanitize(message)
      });

      const pool = getPool();
      if (pool) {
        try {
          await pool.query(
            `INSERT INTO career_applications (name, email, phone, role, portfolio, linkedin, message, resume, onsite) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [sanitize(name), sanitize(email), sanitize(phone), sanitize(role), sanitize(portfolio), sanitize(linkedin), sanitize(message), sanitize(resume), sanitize(onsite)]
          );
        } catch (colErr) {
          // Fallback if resume/onsite columns are not in SQL schema yet
          await pool.query(
            `INSERT INTO career_applications (name, email, phone, role, portfolio, linkedin, message) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [sanitize(name), sanitize(email), sanitize(phone), sanitize(role), sanitize(portfolio || resume), sanitize(linkedin), sanitize(message)]
          );
        }
      }
    } catch (dbErr) {
      console.warn('[DB Apply Log Notice]', dbErr.message);
    }

    // 2. Send Emails (if SMTP is configured)
    if (hasSmtpConfig()) {
      const transporter = createTransporter();

      await transporter.sendMail({
        from:    `"Cloutgency Careers" <${process.env.SMTP_USER}>`,
        to:      process.env.CONTACT_RECEIVER || 'hello@cloutgency.com',
        replyTo: sanitize(email),
        subject: `Career Application: ${sanitize(name)} — ${sanitize(role)}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#111;color:#f5c300;padding:20px 24px;border-radius:8px 8px 0 0">
              <h2 style="margin:0;font-size:20px">New Career Application</h2>
            </div>
            <div style="background:#1a1a1a;color:#fff;padding:24px;border-radius:0 0 8px 8px">
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 0;color:#999;width:120px">Name</td><td style="padding:8px 0;color:#fff">${sanitize(name)}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Email</td><td style="padding:8px 0;color:#fff">${sanitize(email)}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Phone</td><td style="padding:8px 0;color:#fff">${sanitize(phone) || '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Role</td><td style="padding:8px 0;color:#f5c300;font-weight:bold">${sanitize(role)}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Onsite (Chennai)</td><td style="padding:8px 0;color:#fff">${sanitize(onsite) || '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Resume Link</td><td style="padding:8px 0;color:#fff">${resume ? `<a href="${sanitize(resume)}" target="_blank" style="color:#f5c300">${sanitize(resume)}</a>` : '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Portfolio Link</td><td style="padding:8px 0;color:#fff">${portfolio ? `<a href="${sanitize(portfolio)}" target="_blank" style="color:#f5c300">${sanitize(portfolio)}</a>` : '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#999">LinkedIn</td><td style="padding:8px 0;color:#fff">${linkedin ? `<a href="${sanitize(linkedin)}" target="_blank" style="color:#f5c300">${sanitize(linkedin)}</a>` : '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#999;vertical-align:top">Cover Note</td><td style="padding:8px 0;color:#fff;line-height:1.6">${sanitize(message || '').replace(/\n/g, '<br>') || '—'}</td></tr>
              </table>
            </div>
          </div>
        `,
      });
    } else {
      console.log('✦ [Dev Notice] New career application received (SMTP disabled):', { name, email, role, resume, onsite });
    }

    return res.json({ success: true, message: "Application received! We'll review your profile and get in touch soon." });

  } catch (err) {
    console.error('[Apply Form Error]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to submit application. Please try again.' });
  }
});

module.exports = router;
