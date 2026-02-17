/**
 * Portfolio Website Backend Server
 * Express server with Nodemailer for contact form email sending
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();

// ========================================
// Configuration
// ========================================
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'pradnyadange07@gmail.com';
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 5;

// ========================================
// Security Middleware
// ========================================
// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
            fontSrc: ["'self'", "fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            FRONTEND_URL,
            'http://localhost:5500',
            'http://localhost:3000',
            'http://127.0.0.1:5500',
            'http://127.0.0.1:3000',
        ];
        
        // In development, allow all localhost origins
        if (NODE_ENV === 'development') {
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                return callback(null, true);
            }
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// ========================================
// Rate Limiting
// ========================================
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: RATE_LIMIT_MAX, // Limit each IP to RATE_LIMIT_MAX requests per windowMs
    message: {
        success: false,
        error: 'Too many contact attempts, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting in development
    skip: NODE_ENV === 'development' ? false : false,
});

// General API rate limiter (more lenient)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: 'Too many requests, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
});

// ========================================
// Body Parsing
// ========================================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ========================================
// Static Files (Serve Frontend)
// ========================================
app.use(express.static(path.join(__dirname)));

// ========================================
// Email Transporter Configuration
// ========================================
let transporter = null;

function createTransporter() {
    // Check for required environment variables
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️  Email configuration incomplete. Contact form will not send emails.');
        console.warn('   Please configure SMTP settings in .env file');
        return null;
    }

    const transportConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        // Connection timeout settings
        connectionTimeout: 10000,
        socketTimeout: 10000,
    };

    // Gmail-specific optimizations
    if (process.env.SMTP_HOST === 'smtp.gmail.com') {
        transportConfig.service = 'gmail';
    }

    return nodemailer.createTransport(transportConfig);
}

// Initialize transporter
transporter = createTransporter();

// Verify transporter connection
if (transporter) {
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ Email transporter verification failed:', error.message);
        } else {
            console.log('✅ Email transporter ready');
        }
    });
}

// ========================================
// Helper Functions
// ========================================

/**
 * Sanitize input to prevent XSS
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;')
        .trim();
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate HTML email template
 */
function generateEmailTemplate(data) {
    const { name, email, subject, message } = data;
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #6366f1;
                margin-bottom: 20px;
            }
            .header h1 {
                color: #6366f1;
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 20px 0;
            }
            .field {
                margin-bottom: 15px;
            }
            .field-label {
                font-weight: 600;
                color: #666;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .field-value {
                color: #333;
                font-size: 16px;
                margin-top: 5px;
            }
            .message-box {
                background-color: #f5f5f5;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #6366f1;
                margin-top: 5px;
            }
            .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #eee;
                margin-top: 20px;
                color: #999;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📬 New Contact Form Submission</h1>
            </div>
            <div class="content">
                <div class="field">
                    <div class="field-label">Name</div>
                    <div class="field-value">${sanitizeInput(name)}</div>
                </div>
                <div class="field">
                    <div class="field-label">Email</div>
                    <div class="field-value">
                        <a href="mailto:${sanitizeInput(email)}">${sanitizeInput(email)}</a>
                    </div>
                </div>
                <div class="field">
                    <div class="field-label">Subject</div>
                    <div class="field-value">${sanitizeInput(subject || 'No subject')}</div>
                </div>
                <div class="field">
                    <div class="field-label">Message</div>
                    <div class="message-box">${sanitizeInput(message).replace(/\n/g, '<br>')}</div>
                </div>
            </div>
            <div class="footer">
                <p>This email was sent from your portfolio website contact form.</p>
                <p>Received on ${new Date().toLocaleString()}</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

/**
 * Generate auto-reply email template
 */
function generateAutoReplyTemplate(name) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank you for contacting me</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #6366f1;
                margin-bottom: 20px;
            }
            .header h1 {
                color: #6366f1;
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 20px 0;
            }
            .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #eee;
                margin-top: 20px;
                color: #999;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✨ Thank You for Reaching Out!</h1>
            </div>
            <div class="content">
                <p>Hi ${sanitizeInput(name)},</p>
                <p>Thank you for contacting me through my portfolio website. I've received your message and will get back to you as soon as possible.</p>
                <p>I typically respond within 24-48 hours during business days.</p>
                <p>In the meantime, feel free to check out my other work on the portfolio!</p>
                <p>Best regards,<br>Pradnya Dange</p>
            </div>
            <div class="footer">
                <p>This is an automated response. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// ========================================
// API Routes
// ========================================

// Health check endpoint
app.get('/api/health', apiLimiter, (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        emailConfigured: transporter !== null,
    });
});

// Contact form submission endpoint
app.post('/api/contact', 
    contactLimiter,
    [
        // Validation middleware
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
            .escape(),
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Please provide a valid email address')
            .normalizeEmail()
            .isLength({ max: 254 }).withMessage('Email is too long'),
        body('subject')
            .optional()
            .trim()
            .isLength({ max: 200 }).withMessage('Subject must be less than 200 characters')
            .escape(),
        body('message')
            .trim()
            .notEmpty().withMessage('Message is required')
            .isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 and 5000 characters')
            .escape(),
    ],
    async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors.array().map(err => ({
                        field: err.path,
                        message: err.msg,
                    })),
                    code: 'VALIDATION_ERROR',
                });
            }

            // Check if email transporter is configured
            if (!transporter) {
                console.error('Email transporter not configured');
                return res.status(503).json({
                    success: false,
                    error: 'Email service is not configured. Please contact the administrator.',
                    code: 'SERVICE_UNAVAILABLE',
                });
            }

            const { name, email, subject, message } = req.body;

            // Additional spam checks
            const spamKeywords = ['casino', 'lottery', 'winner', 'click here', 'free money', 'viagra', 'crypto'];
            const messageLower = message.toLowerCase();
            const containsSpam = spamKeywords.some(keyword => messageLower.includes(keyword));
            
            if (containsSpam) {
                console.warn(`Potential spam detected from IP: ${req.ip}`);
                return res.status(400).json({
                    success: false,
                    error: 'Your message appears to be spam. Please revise and try again.',
                    code: 'SPAM_DETECTED',
                });
            }

            // Prepare email options
            const mailOptions = {
                from: {
                    name: 'Portfolio Contact Form',
                    address: process.env.SMTP_USER,
                },
                to: CONTACT_EMAIL,
                replyTo: email,
                subject: `Portfolio Contact: ${subject || 'New message from ' + name}`,
                text: `
Name: ${name}
Email: ${email}
Subject: ${subject || 'No subject'}

Message:
${message}

---
Sent from portfolio website on ${new Date().toLocaleString()}
IP: ${req.ip}
                `.trim(),
                html: generateEmailTemplate({ name, email, subject, message }),
            };

            // Send main email
            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', info.messageId);

            // Send auto-reply to the sender
            const autoReplyOptions = {
                from: {
                    name: 'Pradnya Dange',
                    address: process.env.SMTP_USER,
                },
                to: email,
                subject: 'Thank you for contacting me!',
                text: `
Hi ${name},

Thank you for reaching out! I've received your message and will get back to you as soon as possible.

Best regards,
Pradnya Dange
                `.trim(),
                html: generateAutoReplyTemplate(name),
            };

            // Send auto-reply (don't wait for it)
            transporter.sendMail(autoReplyOptions).catch(err => {
                console.error('Failed to send auto-reply:', err.message);
            });

            // Success response
            res.status(200).json({
                success: true,
                message: 'Your message has been sent successfully! I will get back to you soon.',
                messageId: info.messageId,
            });

        } catch (error) {
            console.error('❌ Error sending email:', error);
            
            // Handle specific email errors
            if (error.code === 'EAUTH') {
                return res.status(500).json({
                    success: false,
                    error: 'Email authentication failed. Please contact the administrator.',
                    code: 'EMAIL_AUTH_ERROR',
                });
            }
            
            if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
                return res.status(500).json({
                    success: false,
                    error: 'Could not connect to email server. Please try again later.',
                    code: 'EMAIL_CONNECTION_ERROR',
                });
            }

            // Generic error response
            res.status(500).json({
                success: false,
                error: 'An unexpected error occurred. Please try again later.',
                code: 'INTERNAL_ERROR',
            });
        }
    }
);

// ========================================
// Error Handling Middleware
// ========================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        code: 'NOT_FOUND',
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    // CORS error
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            error: 'Origin not allowed',
            code: 'CORS_ERROR',
        });
    }
    
    // Rate limit error
    if (err.status === 429) {
        return res.status(429).json({
            success: false,
            error: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
        });
    }
    
    // Generic error
    res.status(500).json({
        success: false,
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
    });
});

// ========================================
// Start Server
// ========================================
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Portfolio Server Started!                             ║
║                                                            ║
║   Environment: ${NODE_ENV.padEnd(42)}║
║   Port: ${String(PORT).padEnd(49)}║
║   Frontend URL: ${FRONTEND_URL.padEnd(40)}║
║   Contact Email: ${CONTACT_EMAIL.padEnd(39)}║
║                                                            ║
║   📧 Email Status: ${transporter ? '✅ Configured' : '❌ Not Configured'}${' '.repeat(transporter ? 30 : 27)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
    
    if (!transporter) {
        console.log('\n⚠️  To enable email sending:');
        console.log('   1. Copy .env.example to .env');
        console.log('   2. Configure your SMTP settings');
        console.log('   3. Restart the server\n');
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
    if (transporter) {
        transporter.close();
    }
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received. Shutting down gracefully...');
    if (transporter) {
        transporter.close();
    }
    process.exit(0);
});

module.exports = app;
