require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------------------------------------------------------
   CORS — only allow the known local frontend origins.
   Live Server commonly serves on 127.0.0.1:5500 or
   localhost:5500 depending on VS Code settings, so both
   are allowed. No wildcard '*' is used.
--------------------------------------------------------- */
const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (e.g. curl, Postman) during local testing
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

/* ---------------------------------------------------------
   Nodemailer transport — Gmail SMTP using an App Password.
   Credentials come only from backend/.env, never from the
   frontend or from this file directly.
--------------------------------------------------------- */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify SMTP connection once at startup (does not expose credentials)
transporter.verify(function (error) {
    if (error) {
        console.error('Gmail SMTP connection FAILED:', error.message);
    } else {
        console.log('Gmail SMTP connection successful!');
    }
});

/* ---------------------------------------------------------
   Health check
--------------------------------------------------------- */
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Arthashastra email server is running.'
    });
});

/* ---------------------------------------------------------
   POST /send-consultation
   Receives all consultation form fields, validates the
   required ones, and sends a formatted email via Gmail SMTP.
--------------------------------------------------------- */
app.post('/send-consultation', async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            company,
            profile,
            advisory_areas,
            annual_revenue,
            assets_size,
            objective,
            timeline
        } = req.body || {};

        // Required fields — mirrors the frontend validation in contact.html
        const requiredFields = { name, email, phone, profile, annual_revenue, objective, timeline };
        const missing = Object.entries(requiredFields)
            .filter(([, value]) => !value || String(value).trim() === '')
            .map(([key]) => key);

        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required field(s): ${missing.join(', ')}`
            });
        }

        // basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        const emailBody = `
ARTHASHASTRA
New Consultation Request

CONTACT DETAILS
========================
Name: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company || 'Not provided'}

PROFILE
========================
Profile: ${profile}

ADVISORY FOCUS AREAS
========================
${advisory_areas || 'None selected'}

ENGAGEMENT / INVESTMENT DETAILS
========================
Annual Revenue: ${annual_revenue}
Portfolio / Assets Size: ${assets_size || 'Not provided'}

OBJECTIVE / CHALLENGE
========================
${objective}

EXPECTED TIMELINE
========================
Timeline: ${timeline}

SOURCE
========================
Submitted through:
Arthashastra Website Contact Form
`.trim();

        await transporter.sendMail({
            from: `"Arthashastra Website" <${process.env.SMTP_USER}>`,
            to: process.env.RECEIVER_EMAIL,
            replyTo: email,
            subject: 'New Arthashastra Consultation Request',
            text: emailBody
        });

        return res.status(200).json({
            success: true,
            message: 'Your request has been received. Our advisory team will be in touch shortly.'
        });

    } catch (error) {
        // Never leak SMTP details or the raw error to the client
        console.error('Failed to send consultation email:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while sending your request. Please try again later.'
        });
    }
});

app.listen(PORT, () => {
    console.log('ARTHASHASTRA EMAIL SERVER');
    console.log(`Server running at: http://localhost:${PORT}`);
});