'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const cmsStore = require('../db/cmsStore');
const { requireAuth, requirePrivilege } = require('../middleware/auth');
const workCategories = require('../constants/workCategories');
const router = express.Router();

// ─── Login & Session ─────────────────────────────────────────────────────────

router.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', {
    title: 'Admin Login — Cloutgency Studio',
    error: req.query.error || null,
    returnUrl: req.query.returnUrl || '/admin/dashboard'
  });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, returnUrl } = req.body;
    if (!email || !password) {
      return res.render('admin/login', {
        title: 'Admin Login — Cloutgency Studio',
        error: 'Please enter both email and password.',
        returnUrl: returnUrl || '/admin/dashboard'
      });
    }

    const user = await cmsStore.getUserByEmail(email);
    if (!user) {
      return res.render('admin/login', {
        title: 'Admin Login — Cloutgency Studio',
        error: 'Invalid email credentials.',
        returnUrl: returnUrl || '/admin/dashboard'
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('admin/login', {
        title: 'Admin Login — Cloutgency Studio',
        error: 'Invalid password. Please check and retry.',
        returnUrl: returnUrl || '/admin/dashboard'
      });
    }

    // Set user session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      privileges: user.privileges || []
    };

    res.redirect(returnUrl || '/admin/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    res.render('admin/login', {
      title: 'Admin Login — Cloutgency Studio',
      error: 'An unexpected authentication error occurred.',
      returnUrl: '/admin/dashboard'
    });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// ─── Dashboard Overview ──────────────────────────────────────────────────────

router.get('/', requireAuth, (req, res) => res.redirect('/admin/dashboard'));

router.get('/dashboard', requireAuth, requirePrivilege('dashboard'), async (req, res) => {
  const traffic = cmsStore.getTrafficStats();
  const submissions = await cmsStore.getSubmissions();
  const users = await cmsStore.getUsers();

  const totalServices = cmsStore.getCollection('services').length;
  const totalWorks = cmsStore.getCollection('works').length;
  const totalBlogs = cmsStore.getCollection('blogs').length;
  const totalTeam = cmsStore.getCollection('team').length;
  const totalCaseStudies = cmsStore.getCollection('caseStudies').length;

  res.render('admin/dashboard', {
    title: 'Executive Dashboard — Cloutgency CMS',
    activeTab: 'dashboard',
    user: req.session.user,
    traffic,
    submissions,
    usersCount: users.length,
    stats: {
      totalServices,
      totalWorks,
      totalBlogs,
      totalTeam,
      totalCaseStudies,
      totalCollectionEntries: totalServices + totalWorks + totalBlogs + totalTeam + totalCaseStudies,
      totalSubmissions: (submissions.contact?.length || 0) + (submissions.careers?.length || 0)
    }
  });
});


// ─── Pages Editor — Home and About Us only ───────────────────────────────────
const editablePages = [
  { slug: 'home', name: 'Home Page', path: '/', description: 'Hero, services, works, testimonials and newsletter text and images.' },
  { slug: 'about', name: 'About Us', path: '/about-us', description: 'Story, values, team intro and page text and images.' }
];

router.get('/pages', requireAuth, requirePrivilege('pages'), (req, res) => {
  res.render('admin/pages', {
    title: 'Pages Editor — Cloutgency CMS',
    activeTab: 'pages',
    user: req.session.user,
    pages: editablePages,
    studioPage: null
  });
});

// Studio is built in the next step; until then show a placeholder inside the admin.
router.get('/pages/:slug', requireAuth, requirePrivilege('pages'), (req, res) => {
  const page = editablePages.find(p => p.slug === req.params.slug);
  if (!page) return res.redirect('/admin/pages');
  res.render('admin/pages', {
    title: `${page.name} Studio — Cloutgency CMS`,
    activeTab: 'pages',
    user: req.session.user,
    pages: editablePages,
    studioPage: page
  });
});


// ─── SEO Settings ────────────────────────────────────────────────────────────

router.get('/seo', requireAuth, requirePrivilege('seo'), (req, res) => {
  const seo = cmsStore.getSeo();
  res.render('admin/seo', {
    title: 'SEO & Meta Strategy — Cloutgency CMS',
    activeTab: 'seo',
    user: req.session.user,
    seo
  });
});

// ─── Collections Manager ─────────────────────────────────────────────────────

const collectionMap = {
  services: { title: 'Services Management', key: 'services', priv: 'services' },
  works: { title: 'Portfolio & Works', key: 'works', priv: 'works' },
  case_studies: { title: 'Case Studies', key: 'caseStudies', priv: 'case_studies' },
  blogs: { title: 'Blogs & Articles', key: 'blogs', priv: 'blogs' },
  team: { title: 'Team Members', key: 'team', priv: 'team' }
};

router.get('/collections/:type', requireAuth, (req, res, next) => {
  const type = req.params.type;
  const config = collectionMap[type];
  if (!config) return res.status(404).render('404', { title: 'Collection Not Found' });

  // Check specific privilege
  return requirePrivilege(config.priv)(req, res, () => {
    const items = cmsStore.getCollection(config.key);
    res.render('admin/collections', {
      title: `${config.title} — Cloutgency CMS`,
      activeTab: type,
      user: req.session.user,
      collectionType: type,
      collectionKey: config.key,
      config,
      items,
      workCategories
    });
  });
});

// ─── Form Submissions ────────────────────────────────────────────────────────

router.get('/forms', requireAuth, requirePrivilege('forms'), async (req, res) => {
  const submissions = await cmsStore.getSubmissions();
  res.render('admin/forms', {
    title: 'Form Submissions & Inquiries — Cloutgency CMS',
    activeTab: 'forms',
    user: req.session.user,
    submissions
  });
});

// ─── Media Manager ───────────────────────────────────────────────────────────

router.get('/media', requireAuth, requirePrivilege('assets'), (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const imagesDir = path.join(__dirname, '..', 'public', 'images');
  const uploadsDir = path.join(imagesDir, 'uploads');

  let uploadedFiles = [];
  if (fs.existsSync(uploadsDir)) {
    uploadedFiles = fs.readdirSync(uploadsDir).map(file => ({
      name: file,
      url: `/images/uploads/${file}`,
      size: (fs.statSync(path.join(uploadsDir, file)).size / 1024).toFixed(1) + ' KB'
    }));
  }

  res.render('admin/media', {
    title: 'Media & Asset Manager — Cloutgency CMS',
    activeTab: 'assets',
    user: req.session.user,
    files: uploadedFiles
  });
});

// ─── User Management & Privileges ───────────────────────────────────────────

router.get('/users', requireAuth, requirePrivilege('users'), async (req, res) => {
  const users = await cmsStore.getUsers();
  res.render('admin/users', {
    title: 'User Access & Privileges — Cloutgency CMS',
    activeTab: 'users',
    user: req.session.user,
    users
  });
});

module.exports = router;
