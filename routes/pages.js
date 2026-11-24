'use strict';

const express  = require('express');
const fs = require('fs');
const path = require('path');
const cmsStore = require('../db/cmsStore');
const workCategories = require('../constants/workCategories');
const router = express.Router();

// ─── Shared dynamic page meta builder ────────────────────────────────────────
const siteUrl = process.env.SITE_URL || 'https://cloutgency.com';
const publicDir = path.join(__dirname, '..', 'public');

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function isSafeBlogLink(value) {
  return /^(https?:\/\/|\/(?!\/)|#|mailto:)/i.test(value);
}

function renderBlogMarkdown(markdown) {
  const renderInline = value => {
    const pattern = /!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|_([^_]+)_|`([^`]+)`/g;
    let result = '';
    let cursor = 0;
    for (const match of value.matchAll(pattern)) {
      result += escapeHtml(value.slice(cursor, match.index));
      const [source, imageAlt, imageUrl, linkText, linkUrl, boldText, italicText, codeText] = match;
      if (imageAlt !== undefined) {
        result += /^\/images\/[a-z0-9_./%-]+$/i.test(imageUrl)
          ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(imageAlt)}">`
          : escapeHtml(source);
      } else if (linkText !== undefined) {
        result += isSafeBlogLink(linkUrl)
          ? `<a href="${escapeHtml(linkUrl)}" rel="nofollow noopener noreferrer">${escapeHtml(linkText)}</a>`
          : escapeHtml(linkText);
      } else if (boldText !== undefined) {
        result += `<strong>${escapeHtml(boldText)}</strong>`;
      } else if (italicText !== undefined) {
        result += `<em>${escapeHtml(italicText)}</em>`;
      } else {
        result += `<code>${escapeHtml(codeText)}</code>`;
      }
      cursor = match.index + source.length;
    }
    return result + escapeHtml(value.slice(cursor));
  };

  const blocks = String(markdown || '').trim().split(/\r?\n\s*\r?\n/).filter(Boolean);
  return blocks.map(block => {
    const lines = block.split(/\r?\n/);
    const heading = lines.length === 1 && lines[0].match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      return `<h${level}>${renderInline(heading[2])}</h${level}>`;
    }
    if (lines.every(line => /^\s*[-*]\s+/.test(line))) {
      return `<ul>${lines.map(line => `<li>${renderInline(line.replace(/^\s*[-*]\s+/, ''))}</li>`).join('')}</ul>`;
    }
    if (lines.every(line => /^\s*\d+[.)]\s+/.test(line))) {
      return `<ol>${lines.map(line => `<li>${renderInline(line.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`;
    }
    if (lines.every(line => /^\s*>\s?/.test(line))) {
      return `<blockquote>${lines.map(line => renderInline(line.replace(/^\s*>\s?/, ''))).join('<br>')}</blockquote>`;
    }
    if (lines.length === 1 && /^---+$/.test(lines[0].trim())) return '<hr>';
    return `<p>${lines.map(renderInline).join('<br>')}</p>`;
  }).join('');
}

function getPageMeta(currentPath, defaultTitle, defaultDesc) {
  const dynamicSeo = cmsStore.getPageSeo(currentPath) || {};
  const globalSeo  = cmsStore.getSeo() || {};
  const title       = dynamicSeo.title || defaultTitle;
  const description = dynamicSeo.description || defaultDesc;
  const canonical   = dynamicSeo.canonical || `${siteUrl}${currentPath === '/' ? '/' : currentPath}`;
  const ogImage     = dynamicSeo.ogImage || globalSeo.defaultOgImage || `${siteUrl}/images/og-image.jpg`;

  return {
    title,
    currentPath,
    meta: {
      siteName:    globalSeo.siteName || 'Cloutgency',
      siteUrl,
      description,
      canonical,
      ogTitle:     dynamicSeo.ogTitle || title,
      ogDescription: dynamicSeo.ogDescription || description,
      ogImage,
      twitterCard: globalSeo.twitterCard || 'summary_large_image',
    }
  };
}

// ─── Home ────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const pageData = getPageMeta(
    '/',
    'Creative Agency in Chennai — Grow Your Brand Now | Cloutgency',
    "Cloutgency is Chennai's leading creative agency for branding & digital marketing. The branding agency in Chennai businesses trust. Build yours today."
  );
  pageData.works = cmsStore.getCollection('works')
    .filter(work => work.isActive !== false && work.showOnHome)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  res.render('index', pageData);
});

// ─── About ───────────────────────────────────────────────────────────────────
router.get('/about-us', (req, res) => {
  const pageData = getPageMeta(
    '/about-us',
    'About Us — Who We Are | Cloutgency',
    "Learn about Cloutgency — Chennai's leading creative agency. Our team, our story, and our mission to make brands impossible to ignore."
  );
  pageData.team = cmsStore.getCollection('team')
    .filter(member => member.isActive !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  res.render('about-us', pageData);
});

// ─── Services ────────────────────────────────────────────────────────────────
router.get('/our-services', (req, res) => {
  const pageData = getPageMeta(
    '/our-services',
    'Our Services — Branding, Digital Marketing & More | Cloutgency',
    "Explore Cloutgency's full range of creative services: branding, digital marketing, content creation, performance marketing, web design, and SEO."
  );
  res.render('our-services', pageData);
});

// ─── Our Work ────────────────────────────────────────────────────────────────
router.get('/our-works', (req, res) => {
  const pageData = getPageMeta(
    '/our-works',
    'Our Work — Portfolio & Case Studies | Cloutgency',
    "See Cloutgency's portfolio — real results for real brands. Branding, campaigns, content, and web projects that made an impact."
  );
  pageData.works = cmsStore.getCollection('works')
    .filter(work => work.isActive !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  pageData.workCategories = workCategories;
  res.render('our-works', pageData);
});

// ─── Blog ────────────────────────────────────────────────────────────────────
router.get('/blog', (req, res) => {
  const pageData = getPageMeta(
    '/blog',
    'Blog — Insights, Tips & Stories | Cloutgency',
    "Cloutgency blog — insights, tips, and stories about branding, digital marketing, content creation, and building brands that Gen Z loves."
  );
  pageData.blogs = cmsStore.getCollection('blogs')
    .filter(blog => blog.isPublished !== false)
    .sort((a, b) => (a.sortOrder || a.id || 0) - (b.sortOrder || b.id || 0));
  res.render('blog', pageData);
});

function renderBlogArticle(req, res) {
  const slug = req.params.slug.replace(/\.html$/, '');
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return res.status(404).render('404', {
      title: 'Article Not Found | Cloutgency',
      meta: {
        description: 'The article you are looking for is unavailable.',
        canonical: `${siteUrl}${req.path}`,
        ogImage: `${siteUrl}/images/og-image.jpg`,
        twitterCard: 'summary_large_image'
      },
      currentPath: req.path
    });
  }

  const blog = cmsStore.getCollection('blogs').find(item =>
    item.slug === slug
  );
  if (blog && blog.isPublished === false) {
    return res.status(404).render('404', {
      title: 'Article Not Found | Cloutgency',
      meta: {
        description: 'The article you are looking for is unavailable.',
        canonical: `${siteUrl}${req.path}`,
        ogImage: `${siteUrl}/images/og-image.jpg`,
        twitterCard: 'summary_large_image'
      },
      currentPath: req.path
    });
  }

  if (!blog) {
    const exportedArticle = path.join(publicDir, 'blogs', `${slug}.html`);
    if (fs.existsSync(exportedArticle)) {
      return res.sendFile(exportedArticle);
    }
    return res.status(404).render('404', {
      title: 'Article Not Found | Cloutgency',
      meta: {
        description: 'The article you are looking for is unavailable.',
        canonical: `${siteUrl}${req.path}`,
        ogImage: `${siteUrl}/images/og-image.jpg`,
        twitterCard: 'summary_large_image'
      },
      currentPath: req.path
    });
  }

  const currentPath = `/blogs/${blog.slug}.html`;
  const pageData = getPageMeta(
    currentPath,
    `${blog.title} | Cloutgency`,
    blog.excerpt || `Read ${blog.title} on the Cloutgency blog.`
  );
  pageData.meta.ogImage = blog.coverImage
    ? (blog.coverImage.startsWith('http') ? blog.coverImage : `${siteUrl}${blog.coverImage}`)
    : `${siteUrl}/images/og-image.jpg`;
  pageData.blog = blog;
  pageData.contentHtml = renderBlogMarkdown(blog.content || '');
  res.render('blog-detail', pageData);
}

router.get('/blogs/:slug.html', renderBlogArticle);
router.get('/blogs/:slug', renderBlogArticle);
router.get('/blog/:slug', renderBlogArticle);

router.get('/case-study/:slug', (req, res, next) => {
  const slug = req.params.slug.replace(/\.html$/, '');
  if (!/^[a-z0-9-]+$/i.test(slug)) return next();

  const exportedCaseStudy = path.join(publicDir, 'case-study', `${slug}.html`);
  if (!fs.existsSync(exportedCaseStudy)) return next();
  res.sendFile(exportedCaseStudy);
});

// ─── Contact ─────────────────────────────────────────────────────────────────
router.get('/contact-us', (req, res) => {
  const pageData = getPageMeta(
    '/contact-us',
    'Contact Us — Get in Touch | Cloutgency',
    "Ready to grow your brand? Get in touch with Cloutgency — Chennai's leading creative agency. Let's build something great together."
  );
  res.render('contact-us', pageData);
});

// ─── Careers ─────────────────────────────────────────────────────────────────
router.get('/careers', (req, res) => {
  const pageData = getPageMeta(
    '/careers',
    'Careers — Join Our Team | Cloutgency',
    "Join the Cloutgency team! We are always looking for talented creatives, marketers, and developers. See our open positions."
  );
  res.render('careers', pageData);
});

// ─── Career Sub-pages ────────────────────────────────────────────────────────
const careerPages = [
  'internship', 'apply-job', 'apply-web-internship',
  'content-creator-intern', 'content-writer-intern',
  'graphic-designer-intern', 'product-manager-intern',
  'project-manager-intern', 'sales-intern',
  'video-editor-intern', 'web-development-intern',
  'junior-graphic-designer', 'graphic-designer', 'video-editor',
];

careerPages.forEach(slug => {
  router.get(`/careers/${slug}`, (req, res) => {
    const viewName = `careers/${slug}`;
    const currentPath = `/careers/${slug}`;
    const pageTitle = `${slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — Careers | Cloutgency`;
    const description = `Apply for the ${slug.replace(/-/g, ' ')} position at Cloutgency. Join our growing team in Chennai.`;
    res.render(viewName, getPageMeta(currentPath, pageTitle, description));
  });
});

const legacyPageRedirects = {
  'index.html': '/',
  'home.html': '/',
  'old-home.html': '/',
  'old-home-2.html': '/',
  'about.html': '/about-us',
  'about-us.html': '/about-us',
  'about-us-2.html': '/about-us',
  'about-us-h2.html': '/about-us',
  'about-us-old.html': '/about-us',
  'blog.html': '/blog',
  'careers.html': '/careers',
  'contact-us.html': '/contact-us',
  'contact-us-2.html': '/contact-us',
  'our-services.html': '/our-services',
  'our-work.html': '/our-works',
  'our-work--2.html': '/our-works',
  'our-works.html': '/our-works',
  'our-works-2a.html': '/our-works'
};

Object.entries(legacyPageRedirects).forEach(([legacyPath, destination]) => {
  router.get(`/${legacyPath}`, (req, res) => res.redirect(301, destination));
});

const legacyCareerPages = careerPages.reduce((aliases, slug) => {
  const fileSlug = ['graphic-designer', 'video-editor'].includes(slug)
    ? slug
    : `careers-${slug}`;
  aliases[`${fileSlug}.html`] = `/careers/${slug}`;
  aliases[`careers/${slug}.html`] = `/careers/${slug}`;
  return aliases;
}, {});

Object.entries(legacyCareerPages).forEach(([legacyPath, destination]) => {
  router.get(`/${legacyPath}`, (req, res) => res.redirect(301, destination));
});

// Legacy redirects
router.get('/about-us-2', (req, res) => res.redirect(301, '/about-us'));
router.get('/contact-us-2', (req, res) => res.redirect(301, '/contact-us'));
router.get('/home', (req, res) => res.redirect(301, '/'));
router.get('/our-work', (req, res) => res.redirect(301, '/our-works'));


// ─── 401 ─────────────────────────────────────────────────────────────────────
router.get('/401', (req, res) => {
  res.status(401).render('401', {
    title: '401 — Unauthorized | Cloutgency',
    currentPath: '/401',
    meta: meta({ description: 'Access unauthorized.', canonical: `${siteUrl}/401` }),
  });
});

module.exports = router;
