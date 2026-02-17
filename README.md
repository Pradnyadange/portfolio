# Portfolio Website

A sophisticated, responsive portfolio website with a Node.js/Express backend for the contact form.

## Features

### Frontend
- 🎨 Modern, minimalist design with clean typography
- 🌙 Dark mode toggle with system preference detection
- 📱 Fully responsive across all devices
- ✨ Subtle CSS animations and hover effects
- 🖼️ Filterable project gallery
- 📊 Animated skills progress bars
- 📧 Functional contact form with backend integration

### Backend
- 🚀 Node.js/Express server
- 📧 Nodemailer integration for email sending
- 🔒 Secure environment variable configuration
- ✅ Form validation with express-validator
- 🛡️ Rate limiting to prevent spam
- 🔗 CORS configuration for frontend
- 📨 Auto-reply to form submitters

## Quick Start

### Prerequisites
- Node.js v14.0.0 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your settings
   ```

4. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Email Configuration

### Option 1: Gmail SMTP

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password at [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Update `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   CONTACT_EMAIL=pradnyadange07@gmail.com
   ```

### Option 2: SendGrid

1. Create a SendGrid account
2. Generate an API key
3. Update `.env`:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   CONTACT_EMAIL=pradnyadange07@gmail.com
   ```

### Option 3: Mailgun

1. Create a Mailgun account
2. Get your SMTP credentials
3. Update `.env`:
   ```
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=postmaster@your-domain.mailgun.org
   SMTP_PASS=your-mailgun-password
   CONTACT_EMAIL=pradnyadange07@gmail.com
   ```

## Project Structure

```
Portfolio/
├── index.html          # Main HTML file
├── styles.css          # CSS styles with dark mode
├── script.js           # Frontend JavaScript
├── server.js           # Express backend server
├── package.json        # Node.js dependencies
├── .env.example        # Environment variables template
├── .env                # Your environment variables (not in git)
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## API Endpoints

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "emailConfigured": true
}
```

### `POST /api/contact`
Submit contact form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I'd like to discuss a project..."
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Your message has been sent successfully!",
  "messageId": "<message-id>"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Form validation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SPAM_DETECTED` | Message flagged as spam |
| `SERVICE_UNAVAILABLE` | Email service not configured |
| `EMAIL_AUTH_ERROR` | SMTP authentication failed |
| `EMAIL_CONNECTION_ERROR` | Could not connect to SMTP server |

## Rate Limiting

- **Contact Form**: 5 requests per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP

## Development

### Running in Development
```bash
npm run dev
```
Uses `nodemon` for automatic server restart on file changes.

### Running in Production
```bash
npm start
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin request filtering
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Server-side validation
- **XSS Protection**: Input sanitization
- **Spam Detection**: Basic keyword filtering

## Customization

### Changing the Accent Color
Edit `styles.css` and update the CSS variables:
```css
:root {
    --color-accent: #6366f1;
    --color-accent-hover: #4f46e5;
    --color-accent-light: rgba(99, 102, 241, 0.1);
    --color-accent-glow: rgba(99, 102, 241, 0.3);
}
```

### Adding Projects
Edit `index.html` and add new project cards:
```html
<article class="project-card" data-category="web">
    <div class="project-image">
        <!-- Project image -->
    </div>
    <div class="project-info">
        <h3 class="project-title">Project Name</h3>
        <p class="project-description">Description</p>
        <div class="project-tags">
            <span class="tag">Tag1</span>
            <span class="tag">Tag2</span>
        </div>
    </div>
</article>
```

### Updating Skills
Edit `index.html` and modify skill items:
```html
<div class="skill-item">
    <div class="skill-header">
        <span class="skill-name">Skill Name</span>
        <span class="skill-percent">XX%</span>
    </div>
    <div class="skill-bar">
        <div class="skill-progress" data-progress="XX"></div>
    </div>
</div>
```

## Deployment

### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create

# Set environment variables
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_USER=your-email@gmail.com
heroku config:set SMTP_PASS=your-app-password
heroku config:set CONTACT_EMAIL=pradnyadange07@gmail.com
heroku config:set FRONTEND_URL=https://your-app.herokuapp.com
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Set variables
railway variables set SMTP_HOST=smtp.gmail.com
# ... etc

# Deploy
railway up
```

## License

MIT License - feel free to use for personal or commercial projects.

## Contact

Pradnya Dange - pradnyadange07@gmail.com
