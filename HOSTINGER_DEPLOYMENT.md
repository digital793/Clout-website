# 🚀 Hostinger Deployment Guide — Cloutgency

This repository is a fully migrated, high-performance Node.js / Express web application running SSR with EJS, native MySQL database integration, and SMTP form handling.

---

## 📁 Project Architecture

```
f:\Cloutgency\
├── server.js              ← Express server with Helmet security, compression & caching
├── package.json           ← Dependencies & start scripts (Node >= 18)
├── .env                   ← Active environment configuration
├── .env.example           ← Production template for Hostinger
├── routes/
│   ├── pages.js           ← SEO routes with custom metadata & clean canonical URLs
│   └── forms.js           ← /api/contact & /api/apply endpoints (DB logging + auto-email)
├── db/
│   └── index.js           ← MySQL connection pool & automatic table schema creation
├── views/
│   ├── partials/
│   │   ├── head.ejs       ← Optimized meta tags, Google fonts, CSS links & tracking
│   │   ├── navbar.ejs     ← Liquid glass navbar + morphing logo & full-screen overlay
│   │   └── footer.ejs     ← Shared footer, GSAP suite, toTopBtn, cursor & WhatsApp widget
│   ├── index.ejs          ← Home page
│   ├── about-us.ejs       ← About Us page
│   ├── our-services.ejs   ← Services page
│   ├── our-works.ejs      ← Works / Portfolio page
│   ├── contact-us.ejs     ← Contact Us page
│   ├── careers.ejs        ← Careers listing
│   ├── blog.ejs           ← Blog page
│   ├── 404.ejs            ← 404 Not Found page
│   ├── 401.ejs            ← 401 Unauthorized page
│   └── careers/           ← 14 Career subpages & job application views
├── public/
│   ├── css/               ← Core styles (cloutgency.css, webflow.css, normalize.css)
│   │   └── pages/         ← Modular page-specific style sheets
│   ├── js/                ← webflow.js, forms.js
│   │   └── pages/         ← Modular page-specific interaction scripts
│   ├── images/            ← 600+ high-res brand and media assets
│   ├── videos/            ← Video assets & poster previews
│   └── fonts/             ← Lufga & FamiljenGrotesk local webfonts
└── scripts/
    ├── test_server.js     ← Automated route test runner (23/23 passing)
    ├── test_api.js        ← API validation tests
    └── build_all_views.js ← Template migration engine
```

---

## 🛠️ Step-by-Step Deployment on Hostinger

### Option A: Hostinger Cloud / Web Hosting (Node.js Application Manager)

1. **Log in to Hostinger hPanel**:
   - Go to your domain dashboard.
   - In the sidebar or search, find **Node.js**.

2. **Create / Configure Node.js Application**:
   - **Node.js version**: Select `v18.x` or `v20.x`.
   - **Application root**: `/home/uXXXXXXX/domains/cloutgency.com/public_html` (or your chosen subdirectory).
   - **Application startup file**: `server.js`
   - **Application mode**: `Production`

3. **Upload Files**:
   - Using Git (recommended) or Hostinger File Manager, upload all repository files **except** `node_modules` and `.git`.
   - Ensure the `.env` file is uploaded with production values (see `.env.example`).

4. **Install Dependencies**:
   - In the Node.js manager, click **"Run NPM Install"**, or via SSH:
     ```bash
     npm install --production
     ```

5. **Setup Hostinger MySQL Database**:
   - In hPanel, go to **Databases → MySQL Databases**.
   - Create a database: e.g., `u123456789_cloutgency`.
   - Create a user: e.g., `u123456789_clout` and assign a strong password.
   - Enter these credentials into `.env`:
     ```env
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=u123456789_clout
     DB_PASSWORD=your_secure_password
     DB_NAME=u123456789_cloutgency
     ```
   - *Note:* The tables (`contact_submissions` and `career_applications`) are **automatically created** on the first server start!

6. **Setup Email (Hostinger Titan Mail)**:
   - In hPanel, go to **Emails → Email Accounts**.
   - Create `hello@cloutgency.com` or your preferred email address.
   - Set in `.env`:
     ```env
     SMTP_HOST=smtp.hostinger.com
     SMTP_PORT=465
     SMTP_SECURE=true
     SMTP_USER=hello@cloutgency.com
     SMTP_PASS=your_email_password
     CONTACT_RECEIVER=hello@cloutgency.com
     ```

7. **Restart the Node.js App**:
   - Click **Restart Application** in hPanel.
   - Your website is now live at `https://cloutgency.com`!

---

### Option B: Hostinger VPS (Ubuntu / Debian with Nginx & PM2)

If using Hostinger VPS:

1. **Install Node.js & PM2**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

2. **Clone & Setup**:
   ```bash
   cd /var/www/cloutgency
   npm install --production
   cp .env.example .env
   # Edit .env with your credentials
   nano .env
   ```

3. **Start with PM2**:
   ```bash
   pm2 start server.js --name "cloutgency" -i max
   pm2 save
   pm2 startup
   ```

4. **Nginx Reverse Proxy Config**:
   ```nginx
   server {
       server_name cloutgency.com www.cloutgency.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

---

## 🧪 Local Testing

To test everything locally:

```bash
# Install dependencies
npm install

# Run automated route tests (checks all 23 views)
node scripts/test_server.js

# Run API validation tests
node scripts/test_api.js

# Start local server
npm run dev
# Open http://localhost:3000
```
