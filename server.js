'use strict';

require('dotenv').config();

const express    = require('express');
const fs         = require('fs');
const path       = require('path');
const helmet     = require('helmet');
const compression = require('compression');
const morgan     = require('morgan');

const session      = require('express-session');

const pageRoutes     = require('./routes/pages');
const formRoutes     = require('./routes/forms');
const adminRoutes    = require('./routes/admin');
const apiAdminRoutes = require('./routes/api_admin');
const trafficTracker = require('./middleware/traffic');
const cmsStore       = require('./db/cmsStore');
const { initDb }     = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

// Initialize DB tables and CMS Store
initDb();
cmsStore.init();

// ─── Security & Performance ──────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Body & Session Parsing ──────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.json({ limit: '20mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'cloutgency_executive_studio_key_2026',
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset cookie expiry on every response (stays alive while active)
  cookie: {
    maxAge: 2 * 60 * 60 * 1000, // 2 hours of inactivity = auto logout
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE === 'true'
  }
}));

// Real-time Traffic Tracking
app.use(trafficTracker);

// ─── View Engine ─────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Static Files ────────────────────────────────────────────────────────────
const publicFiles = express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '30d' : '4h',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp4') || filePath.endsWith('.webm')) {
      res.setHeader('Accept-Ranges', 'bytes');
    }
    // Allow aggressive cache for images, fonts, and videos
    if (/\.(png|jpg|jpeg|gif|svg|webp|avif|ttf|woff|woff2|mp4|webm)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    }
  }
});
app.use((req, res, next) => {
  if (/^\/blogs\/[^/]+(?:\.html)?\/?$/.test(req.path)) return next();
  publicFiles(req, res, () => {
    // Fallback: If a relative asset request includes /images/, /videos/, /fonts/, /css/, /js/ from a subpage
    if (/\/(images|videos|fonts|css|js)\//i.test(req.path)) {
      const match = req.path.match(/\/(images|videos|fonts|css|js)\/.+$/i);
      if (match) {
        const localPath = path.join(__dirname, 'public', match[0].replace(/^\//, ''));
        if (fs.existsSync(localPath)) {
          return res.sendFile(localPath);
        }
      }
    }
    next();
  });
});

// ─── Webflow IX2 Page ID Middleware ──────────────────────────────────────────
const WF_PAGE_MAP = {
  '/': '6a015d6316856f665633cd5c',
  '/about-us': '6a11a2ea45457fc67ca969f3',
  '/our-services': '69c92eb6849a6cb9ca9d41a1',
  '/our-works': '6a0e8d3639b75dd2ea8da405',
  '/contact-us': '69dfc25bdc64ce5dae97beee',
  '/careers': '6a1c84746251df8cb0b5fc7c',
  '/blog': '6a561799a82f861c10be3ba7',
  '/careers/apply-job': '6a1c8dc5321baeb98913b484',
  '/careers/apply-web-internship': '6a9a9f7bcf1a0eca8758a5f2',
  '/careers/content-creator-intern': '6a9aa375cf1a0eca875b060e',
  '/careers/content-writer-intern': '6aa3c45092edff55bc8a23d5',
  '/careers/graphic-designer-intern': '6aa3c382b0acb4a8f2253c77',
  '/careers/internship': '6a96a594500376d35466813d',
  '/careers/junior-graphic-designer': '6a92d2153810516319535958',
  '/careers/product-manager-intern': '6a9a9738df382b23376200aa',
  '/careers/project-manager-intern': '6a9e95c57937ba9e39ab3955',
  '/careers/sales-intern': '6aa3c4f38545d2d9034afe29',
  '/careers/video-editor-intern': '6aa3c1fc9d8e7a569ca3a4e3',
  '/careers/web-development-intern': '6a3382d1442ab5f027c58ddf',
  '/careers/graphic-designer': '6a1c8ff165d062b2a6e7b9b0',
  '/careers/video-editor': '6a3a6b120c8e2925344a2197',
  '/401': '66b239af380e667ab8224115',
  '/404': '6673e4712b03e7dafbd1cd3f',
};

app.use((req, res, next) => {
  res.locals.wfPage = WF_PAGE_MAP[req.path] || '';
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/admin', adminRoutes);
app.use('/api/admin', apiAdminRoutes);
app.use('/', pageRoutes);
app.use('/api', formRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 — Page Not Found | Cloutgency',
    meta: {
      description: 'The page you are looking for does not exist.',
      canonical: `${process.env.SITE_URL || 'https://cloutgency.com'}/404`,
    },
    currentPath: req.path,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Error]', err.stack);
  res.status(500).render('404', {
    title: '500 — Server Error | Cloutgency',
    meta: {
      description: 'An internal server error occurred.',
      canonical: `${process.env.SITE_URL || 'https://cloutgency.com'}/500`,
    },
    currentPath: req.path,
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────
if (require.main === module) {
  const os = require('os');
  const getNetworkIp = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return null;
  };

  const networkIp = getNetworkIp();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ✦ Cloutgency server running`);
    console.log(`  ✦ Local:   http://localhost:${PORT}`);
    if (networkIp) {
      console.log(`  ✦ Network: http://${networkIp}:${PORT}`);
    }
    console.log(`  ✦ ENV:     ${process.env.NODE_ENV || 'development'}\n`);
  });
}

module.exports = app;
