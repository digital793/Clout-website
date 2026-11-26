'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const cmsStore = require('../db/cmsStore');
const { requireAuth, requirePrivilege } = require('../middleware/auth');
const upload = require('../middleware/upload');
const workCategories = require('../constants/workCategories');
const router = express.Router();

// ─── Save Page Section Content ───────────────────────────────────────────────
router.post('/pages/:slug/:section', requireAuth, requirePrivilege('pages'), async (req, res) => {
  try {
    const { slug, section } = req.params;
    const content = req.body;

    const updated = await cmsStore.updatePageSection(slug, section, content);
    res.json({ success: true, message: `Section [${section}] updated successfully`, data: updated });
  } catch (err) {
    console.error('Section update error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Page Studio: publish text/image edits ──────────────────────────────────
const { studioSlug } = require('../middleware/pageContent');
const STUDIO_PAGES = ['home', 'about'];

router.post('/studio/:page', requireAuth, requirePrivilege('pages'), async (req, res) => {
  try {
    const { page } = req.params;
    if (!STUDIO_PAGES.includes(page)) return res.status(404).json({ success: false, error: 'Unknown page' });
    const input = (req.body && req.body.fields) || {};
    const fields = {};
    for (const [key, value] of Object.entries(input)) {
      if (!/^[A-Za-z0-9_]+\.[A-Za-z0-9_]+$/.test(key)) return res.status(400).json({ success: false, error: `Invalid field: ${key}` });
      if (value !== null && (typeof value !== 'string' || value.length > 5000)) {
        return res.status(400).json({ success: false, error: `Invalid value for ${key}` });
      }
      fields[key] = value; // null = back to the original text
    }
    if (!Object.keys(fields).length) return res.status(400).json({ success: false, error: 'Nothing to publish' });
    const saved = await cmsStore.updatePageSection(studioSlug(page), 'fields', fields);
    res.json({ success: true, message: 'Published', fields: saved });
  } catch (err) {
    console.error('Studio publish error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Page Studio: image upload ───────────────────────────────────────────────
router.post('/studio-upload', requireAuth, requirePrivilege('pages'), (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, error: err.message });
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    if (!/^image\//.test(req.file.mimetype)) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, error: 'Please upload an image file' });
    }
    res.json({ success: true, url: `/images/uploads/${req.file.filename}` });
  });
});

// ─── Update Global SEO ───────────────────────────────────────────────────────
router.post('/seo/global', requireAuth, requirePrivilege('seo'), async (req, res) => {
  try {
    const updated = await cmsStore.updateGlobalSeo(req.body);
    res.json({ success: true, message: 'Global SEO settings updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Update Page-wise SEO ────────────────────────────────────────────────────
router.post('/seo/page', requireAuth, requirePrivilege('seo'), async (req, res) => {
  try {
    const { pagePath, ...seoData } = req.body;
    if (!pagePath) return res.status(400).json({ success: false, error: 'pagePath is required' });

    const updated = await cmsStore.updatePageSeo(pagePath, seoData);
    res.json({ success: true, message: `SEO for page [${pagePath}] updated successfully`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Collections CRUD ────────────────────────────────────────────────────────
const keyToPrivilege = {
  services: 'services',
  works: 'works',
  caseStudies: 'case_studies',
  blogs: 'blogs',
  team: 'team'
};

router.post('/collections/:key', requireAuth, async (req, res, next) => {
  const key = req.params.key;
  const priv = keyToPrivilege[key];
  if (!priv) return res.status(400).json({ success: false, error: 'Invalid collection key' });

  return requirePrivilege(priv)(req, res, async () => {
    try {
      let itemData = req.body;
      if (key === 'works') {
        const categoryValues = new Set(workCategories.map(category => category.value));
        const title = String(req.body.title || '').trim();
        const client = String(req.body.client || '').trim();
        const category = String(req.body.category || '');
        const image = String(req.body.image || '');
        const videoUrl = String(req.body.videoUrl || '');
        const highlightText = String(req.body.highlightText || '').trim();
        const shortDesc = String(req.body.shortDesc || '').trim();
        const tags = Array.isArray(req.body.tags)
          ? req.body.tags.map(tag => String(tag).trim()).filter(Boolean)
          : [];

        if (!title || !client || !image || !shortDesc) {
          return res.status(400).json({
            success: false,
            error: 'Brand, title, image, and subtext are required.'
          });
        }
        if (!categoryValues.has(category)) {
          return res.status(400).json({ success: false, error: 'Choose a valid work filter category.' });
        }
        if (highlightText && !title.includes(highlightText)) {
          return res.status(400).json({ success: false, error: 'Highlighted text must appear in the title.' });
        }
        if (!image.startsWith('/images/')) {
          return res.status(400).json({ success: false, error: 'Choose an image stored in the public images folder.' });
        }
        if (videoUrl && !videoUrl.startsWith('/videos/')) {
          return res.status(400).json({ success: false, error: 'Choose a video stored in the public videos folder.' });
        }

        itemData = {
          id: req.body.id || undefined,
          client,
          title,
          highlightText,
          category,
          tags,
          shortDesc,
          image,
          videoUrl,
          link: String(req.body.link || '#').trim() || '#',
          showOnHome: req.body.showOnHome === true || req.body.showOnHome === 'true',
          isActive: req.body.isActive !== false && req.body.isActive !== 'false'
        };
        if (!itemData.id) {
          itemData.sortOrder = cmsStore.getCollection('works')
            .reduce((max, item) => Math.max(max, Number(item.sortOrder) || 0), 0) + 1;
        }
      } else if (key === 'blogs') {
        const title = String(req.body.title || '').trim();
        const slug = String(req.body.slug || '').trim();
        const author = String(req.body.author || '').trim();
        const publishedAt = String(req.body.publishedAt || '').trim();
        const readTime = String(req.body.readTime || '').trim();
        const excerpt = String(req.body.excerpt || '').trim();
        const content = String(req.body.content || '').trim();
        const coverImage = String(req.body.coverImage || '').trim();
        const tags = Array.isArray(req.body.tags)
          ? req.body.tags.map(tag => String(tag).trim()).filter(Boolean)
          : [];
        const existingBlogs = cmsStore.getCollection('blogs');

        if (!title || !slug || !publishedAt || !excerpt || !coverImage) {
          return res.status(400).json({
            success: false,
            error: 'Title, slug, published date, excerpt, and cover image are required.'
          });
        }
        if (!req.body.id && !content) {
          return res.status(400).json({
            success: false,
            error: 'Add the article body before creating a new blog post.'
          });
        }
        if (title.length > 200 || excerpt.length > 500 || content.length > 500000) {
          return res.status(400).json({
            success: false,
            error: 'Title must be under 200 characters, excerpt under 500, and article body under 500,000.'
          });
        }
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
          return res.status(400).json({ success: false, error: 'Use a lowercase URL slug with hyphens only.' });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt) ||
          Number.isNaN(Date.parse(`${publishedAt}T00:00:00Z`)) ||
          new Date(`${publishedAt}T00:00:00Z`).toISOString().slice(0, 10) !== publishedAt) {
          return res.status(400).json({ success: false, error: 'Enter a valid published date.' });
        }
        if (existingBlogs.some(blog =>
          blog.slug === slug && String(blog.id) !== String(req.body.id || '')
        )) {
          return res.status(409).json({ success: false, error: 'That article URL slug is already in use.' });
        }
        const exportedArticle = path.join(__dirname, '..', 'public', 'blogs', `${slug}.html`);
        if (!req.body.id && fs.existsSync(exportedArticle)) {
          return res.status(409).json({
            success: false,
            error: 'That URL belongs to an original published article. Choose another slug to avoid replacing its full page.'
          });
        }
        if (!coverImage.startsWith('/images/')) {
          return res.status(400).json({ success: false, error: 'Choose a cover image from the public images folder.' });
        }

        itemData = {
          id: req.body.id || undefined,
          title,
          slug,
          author,
          readTime,
          publishedAt,
          excerpt,
          coverImage,
          tags,
          content,
          isPublished: req.body.isPublished !== false && req.body.isPublished !== 'false'
        };
        if (!itemData.id) {
          itemData.sortOrder = existingBlogs
            .reduce((max, blog) => Math.max(max, Number(blog.sortOrder) || Number(blog.id) || 0), 0) + 1;
        }
      } else if (key === 'team') {
        const name = String(req.body.name || req.body.title || '').trim();
        const role = String(req.body.role || req.body.category || '').trim();
        const department = String(req.body.department || 'managers').trim();
        const image = String(req.body.image || '').trim();
        const altImage = String(req.body.altImage || '').trim();
        const altName = String(req.body.altName || name).trim();
        const bio = String(req.body.bio || req.body.shortDesc || '').trim();
        const linkedinUrl = String(req.body.linkedinUrl || req.body.link || '').trim();

        if (!name) {
          return res.status(400).json({ success: false, error: 'Team member name is required.' });
        }
        if (!image) {
          return res.status(400).json({ success: false, error: 'Default front image is required.' });
        }

        itemData = {
          id: req.body.id ? Number(req.body.id) : undefined,
          name,
          title: name,
          role,
          category: role,
          department,
          image,
          altImage: altImage || image,
          altName,
          bio,
          shortDesc: bio || role,
          linkedinUrl,
          link: linkedinUrl,
          isActive: req.body.isActive !== false && req.body.isActive !== 'false'
        };

        if (!itemData.id) {
          const existingTeam = cmsStore.getCollection('team');
          itemData.sortOrder = existingTeam.reduce((max, m) => Math.max(max, Number(m.sortOrder) || Number(m.id) || 0), 0) + 1;
        }
      }
      const saved = await cmsStore.saveItem(key, itemData);
      res.json({ success: true, message: 'Item saved successfully', data: saved });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
});

router.post('/works/upload/:type', requireAuth, requirePrivilege('works'), (req, res, next) => {
  const { type } = req.params;
  if (type !== 'image' && type !== 'video') {
    return res.status(400).json({ success: false, error: 'Upload type must be image or video.' });
  }

  upload.createWorkUpload(type).single('file')(req, res, error => {
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Choose a file to upload.' });
    }

    const folder = type === 'image' ? 'images' : 'videos';
    res.json({
      success: true,
      url: `/${folder}/works/${req.file.filename}`,
      filename: req.file.filename,
      size: req.file.size
    });
  });
});

function handleBlogImageUpload(req, res) {
  upload.createBlogImageUpload().single('file')(req, res, error => {
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Choose a cover image to upload.' });
    }
    res.json({
      success: true,
      url: `/images/blogs/${req.file.filename}`,
      filename: req.file.filename,
      size: req.file.size
    });
  });
}

router.post('/blogs/upload/image', requireAuth, requirePrivilege('blogs'), handleBlogImageUpload);
router.post('/blogs/upload/inline-image', requireAuth, requirePrivilege('blogs'), handleBlogImageUpload);

router.delete('/collections/:key/:id', requireAuth, async (req, res) => {
  const { key, id } = req.params;
  const priv = keyToPrivilege[key];
  if (!priv) return res.status(400).json({ success: false, error: 'Invalid collection key' });

  return requirePrivilege(priv)(req, res, async () => {
    try {
      const success = await cmsStore.deleteItem(key, id);
      res.json({ success, message: success ? 'Item deleted successfully' : 'Item not found' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
});

// ─── User Management & Privileges (Super Admin Only) ────────────────────────
router.post('/users', requireAuth, requirePrivilege('users'), async (req, res) => {
  try {
    const { username, email, password, role, privileges } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'Username, email and password are required' });
    }

    const existing = await cmsStore.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, error: 'A user with this email already exists' });
    }

    const user = await cmsStore.createUser({
      username,
      email,
      password,
      role: role || 'editor',
      privileges: privileges || []
    });

    res.json({ success: true, message: 'User created successfully', data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/users/:id/privileges', requireAuth, requirePrivilege('users'), async (req, res) => {
  try {
    const { id } = req.params;
    const { privileges, role } = req.body;

    const updated = await cmsStore.updateUserPrivileges(id, privileges, role);
    res.json({ success: true, message: 'User privileges updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/users/:id', requireAuth, requirePrivilege('users'), async (req, res) => {
  try {
    const { id } = req.params;
    if (String(id) === String(req.session.user.id)) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own account' });
    }

    const success = await cmsStore.deleteUser(id);
    res.json({ success, message: success ? 'User removed' : 'User not found or cannot delete superadmin' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Media Upload ────────────────────────────────────────────────────────────
router.post('/media/upload', requireAuth, requirePrivilege('assets'), upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const fileUrl = `/images/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
      size: (req.file.size / 1024).toFixed(1) + ' KB'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
