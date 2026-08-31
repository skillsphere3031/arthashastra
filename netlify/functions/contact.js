const nodemailer = require("nodemailer");

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: false,
                message: "Method not allowed."
            })
        };
    }

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
        } = JSON.parse(event.body || "{}");

        // Required fields
        const requiredFields = {
            name,
            email,
            phone,
            profile,
            annual_revenue,
            objective,
            timeline
        };

        const missing = Object.entries(requiredFields)
            .filter(([, value]) => !value || String(value).trim() === "")
            .map(([key]) => key);

        if (missing.length > 0) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message: `Missing required field(s): ${missing.join(", ")}`
                })
            };
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message: "Please provide a valid email address."
                })
            };
        }

        // Gmail SMTP
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const emailBody = `
ARTHASHASTRA
New Consultation Request

CONTACT DETAILS
========================
Name: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company || "Not provided"}

PROFILE
========================
Profile: ${profile}

ADVISORY FOCUS AREAS
========================
${advisory_areas || "None selected"}

ENGAGEMENT / INVESTMENT DETAILS
========================
Annual Revenue: ${annual_revenue}
Portfolio / Assets Size: ${assets_size || "Not provided"}

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
            subject: "New Arthashastra Consultation Request",
            text: emailBody
        });

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: true,
                message:
                    "Your request has been received. Our advisory team will be in touch shortly."
            })
        };

    } catch (error) {
        console.error(
            "Failed to send consultation email:",
            error.message
        );

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: false,
                message:
                    "Something went wrong while sending your request. Please try again later."
            })
        };
    }
};