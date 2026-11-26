'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { getPool } = require('./index');
const defaultSeed = require('./seedData');
const { migrateBlogsFromWebflow } = require('./blogExportMigration');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'cms_store.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache
let cache = null;

// Initialize or load JSON store
function loadJsonStore() {
  if (cache) return cache;

  if (fs.existsSync(STORE_FILE)) {
    try {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      cache = JSON.parse(raw);
    } catch (e) {
      console.warn('✦ CMS: Error parsing existing store JSON, generating fresh copy from seed');
      cache = null;
    }
  }

  const legacyWorkTitles = [
    'Naturals Brand Campaign',
    'DRA Luxury Residences',
    'Dr. B Aesthetics',
    'KKIX Customs Sneaker Showcase',
    'Soft Serve Ice Creamery',
    'Super Chennai Cultural Initiative'
  ];
  if (
    cache &&
    Array.isArray(cache.works) &&
    cache.works.length === legacyWorkTitles.length &&
    cache.works.every((item, index) => item.title === legacyWorkTitles[index])
  ) {
    cache.works = JSON.parse(JSON.stringify(defaultSeed.works));
    saveJsonStore(cache);
  }

  const legacyBlogEntries = [
    { id: 1, slug: 'psychology-of-colour-in-branding', title: 'The Psychology of Colour in Modern Brand Design' },
    { id: 2, slug: 'how-to-choose-a-creative-agency-for-brand-strategy', title: 'How to Choose a Creative Agency for Brand Strategy in 2026' },
    { id: 3, slug: 'why-gen-z-ignores-traditional-ads', title: 'Why Gen Z Ignores Traditional Advertisements' }
  ];
  if (
    cache &&
    Array.isArray(cache.blogs) &&
    cache.blogs.length === legacyBlogEntries.length &&
    cache.blogs.every((item, index) =>
      String(item.id) === String(legacyBlogEntries[index].id) &&
      item.slug === legacyBlogEntries[index].slug &&
      item.title === legacyBlogEntries[index].title
    )
  ) {
    const existingContentBySlug = new Map(
      cache.blogs.filter(item => item.content).map(item => [item.slug, item.content])
    );
    cache.blogs = JSON.parse(JSON.stringify(defaultSeed.blogs)).map(item => ({
      ...item,
      content: existingContentBySlug.get(item.slug) || item.content || ''
    }));
    saveJsonStore(cache);
  }
  if (cache && migrateBlogsFromWebflow(cache)) {
    saveJsonStore(cache);
  }

  if (!cache) {
    cache = {
      users: [
        {
          id: 1,
          username: 'superadmin',
          email: 'admin@cloutgency.com',
          // Default password is 'admin'
          password: bcrypt.hashSync('admin', 10),
          role: 'superadmin',
          privileges: [
            'dashboard',
            'forms',
            'pages',
            'seo',
            'services',
            'works',
            'case_studies',
            'blogs',
            'team',
            'testimonials',
            'assets',
            'users'
          ],
          createdAt: new Date().toISOString()
        }
      ],
      seo: JSON.parse(JSON.stringify(defaultSeed.seo)),
      pages: JSON.parse(JSON.stringify(defaultSeed.pages)),
      services: JSON.parse(JSON.stringify(defaultSeed.services)),
      works: JSON.parse(JSON.stringify(defaultSeed.works)),
      caseStudies: JSON.parse(JSON.stringify(defaultSeed.caseStudies)),
      blogs: JSON.parse(JSON.stringify(defaultSeed.blogs)),
      team: JSON.parse(JSON.stringify(defaultSeed.team)),
      submissions: {
        contact: [],
        careers: []
      },
      traffic: []
    };
    migrateBlogsFromWebflow(cache);
    saveJsonStore(cache);
  }

  return cache;
}

function saveJsonStore(data) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('✦ CMS: Failed to write to JSON store:', err.message);
  }
}

// ─── MySQL Initialization & Auto Schema ──────────────────────────────────────
async function initCmsDatabase() {
  loadJsonStore();
  const pool = getPool();
  if (!pool) {
    console.log('✦ CMS: Running on local high-performance store (MySQL pool idle)');
    return;
  }

  try {
    const conn = await pool.getConnection();

    // 1. Users Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS cms_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'editor',
        privileges JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. SEO Settings Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS cms_seo_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        data_json LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Page Content Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS cms_page_content (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_slug VARCHAR(100) NOT NULL,
        section_key VARCHAR(100) NOT NULL,
        content_json LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_page_section (page_slug, section_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Dynamic Collections Tables
    const collections = ['cms_services', 'cms_works', 'cms_case_studies', 'cms_blogs', 'cms_team'];
    for (const tbl of collections) {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS ${tbl} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          item_id INT NOT NULL,
          data_json LONGTEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uq_item (item_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    }

    // 5. Traffic Analytics Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS site_traffic (
        id INT AUTO_INCREMENT PRIMARY KEY,
        path VARCHAR(255) NOT NULL,
        ip_hash VARCHAR(100),
        user_agent VARCHAR(500),
        referrer VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default super admin if none exists
    const [userRows] = await conn.query('SELECT COUNT(*) as cnt FROM cms_users');
    if (userRows[0].cnt === 0 && cache && cache.users && cache.users.length > 0) {
      const u = cache.users[0];
      await conn.query(
        'INSERT INTO cms_users (username, email, password, role, privileges) VALUES (?, ?, ?, ?, ?)',
        [u.username, u.email, u.password, u.role, JSON.stringify(u.privileges)]
      );
      console.log('✦ CMS: Seeded Super Admin into MySQL');
    }

    conn.release();
    console.log('✦ CMS: MySQL tables verified & synchronized');
  } catch (err) {
    console.warn('✦ CMS MySQL initialization warning:', err.message);
  }
}

// ─── Data Access API ─────────────────────────────────────────────────────────

const cmsStore = {
  // Store initialization
  init: initCmsDatabase,

  // ── SEO ───────────────────────────────────────────────────────────────────
  getSeo() {
    const data = loadJsonStore();
    return data.seo || defaultSeed.seo;
  },

  async updateGlobalSeo(updates) {
    const data = loadJsonStore();
    data.seo = { ...data.seo, ...updates };
    saveJsonStore(data);

    const pool = getPool();
    if (pool) {
      try {
        await pool.query(
          'INSERT INTO cms_seo_settings (setting_key, data_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_json = ?',
          ['global_seo', JSON.stringify(data.seo), JSON.stringify(data.seo)]
        );
      } catch (e) {
        console.warn('MySQL SEO sync notice:', e.message);
      }
    }
    return data.seo;
  },

  async updatePageSeo(pagePath, seoData) {
    const data = loadJsonStore();
    if (!data.seo.pages) data.seo.pages = {};
    data.seo.pages[pagePath] = { ...(data.seo.pages[pagePath] || {}), ...seoData };
    saveJsonStore(data);

    const pool = getPool();
    if (pool) {
      try {
        await pool.query(
          'INSERT INTO cms_seo_settings (setting_key, data_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_json = ?',
          [`page_seo_${pagePath}`, JSON.stringify(data.seo.pages[pagePath]), JSON.stringify(data.seo.pages[pagePath])]
        );
      } catch (e) {
        console.warn('MySQL Page SEO sync notice:', e.message);
      }
    }
    return data.seo.pages[pagePath];
  },

  getPageSeo(pagePath) {
    const seo = this.getSeo();
    return (seo.pages && seo.pages[pagePath]) || null;
  },

  // ── Page Sections ──────────────────────────────────────────────────────────
  getPageContent(pageSlug) {
    const data = loadJsonStore();
    return (data.pages && data.pages[pageSlug]) || defaultSeed.pages[pageSlug] || {};
  },

  getAllPagesContent() {
    const data = loadJsonStore();
    return data.pages || defaultSeed.pages;
  },

  async updatePageSection(pageSlug, sectionKey, content) {
    const data = loadJsonStore();
    if (!data.pages) data.pages = {};
    if (!data.pages[pageSlug]) data.pages[pageSlug] = {};

    data.pages[pageSlug][sectionKey] = {
      ...(data.pages[pageSlug][sectionKey] || {}),
      ...content
    };
    saveJsonStore(data);

    const pool = getPool();
    if (pool) {
      try {
        await pool.query(
          'INSERT INTO cms_page_content (page_slug, section_key, content_json) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE content_json = ?',
          [pageSlug, sectionKey, JSON.stringify(data.pages[pageSlug][sectionKey]), JSON.stringify(data.pages[pageSlug][sectionKey])]
        );
      } catch (e) {
        console.warn('MySQL Section sync notice:', e.message);
      }
    }
    return data.pages[pageSlug][sectionKey];
  },

  // ── Collections (Services, Works, Case Studies, Blogs, Team) ───────────────
  getCollection(name) {
    const data = loadJsonStore();
    return data[name] || defaultSeed[name] || [];
  },

  getItem(collectionName, id) {
    const items = this.getCollection(collectionName);
    return items.find(item => String(item.id) === String(id)) || null;
  },

  async saveItem(collectionName, item) {
    const data = loadJsonStore();
    // a collection added after the store was created starts from its seed entries
    if (!data[collectionName]) data[collectionName] = JSON.parse(JSON.stringify(defaultSeed[collectionName] || []));

    let updatedItem = null;
    if (item.id) {
      const idx = data[collectionName].findIndex(x => String(x.id) === String(item.id));
      if (idx !== -1) {
        data[collectionName][idx] = { ...data[collectionName][idx], ...item };
        updatedItem = data[collectionName][idx];
      }
    }

    if (!updatedItem) {
      const maxId = data[collectionName].reduce((max, x) => Math.max(max, parseInt(x.id) || 0), 0);
      updatedItem = { ...item, id: maxId + 1 };
      data[collectionName].push(updatedItem);
    }

    saveJsonStore(data);
    return updatedItem;
  },

  async deleteItem(collectionName, id) {
    const data = loadJsonStore();
    if (!data[collectionName]) {
      if (!defaultSeed[collectionName]) return false;
      data[collectionName] = JSON.parse(JSON.stringify(defaultSeed[collectionName]));
    }
    const initialLen = data[collectionName].length;
    data[collectionName] = data[collectionName].filter(x => String(x.id) !== String(id));
    saveJsonStore(data);
    return data[collectionName].length < initialLen;
  },

  // ── Users & Privileges ─────────────────────────────────────────────────────
  async getUsers() {
    const pool = getPool();
    if (pool) {
      try {
        const [rows] = await pool.query('SELECT id, username, email, role, privileges, created_at as createdAt FROM cms_users ORDER BY id ASC');
        if (rows.length > 0) {
          return rows.map(r => ({
            ...r,
            privileges: typeof r.privileges === 'string' ? JSON.parse(r.privileges) : (r.privileges || [])
          }));
        }
      } catch (e) {
        console.warn('MySQL getUsers fallback to memory:', e.message);
      }
    }
    const data = loadJsonStore();
    return (data.users || []).map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      privileges: u.privileges || [],
      createdAt: u.createdAt
    }));
  },

  async getUserByEmail(email) {
    const input = (email || '').toLowerCase().trim();
    const pool = getPool();
    if (pool) {
      try {
        const [rows] = await pool.query('SELECT * FROM cms_users WHERE LOWER(email) = ? OR LOWER(username) = ?', [input, input]);
        if (rows.length > 0) {
          const user = rows[0];
          return {
            ...user,
            privileges: typeof user.privileges === 'string' ? JSON.parse(user.privileges) : (user.privileges || [])
          };
        }
      } catch (e) {
        console.warn('MySQL getUserByEmail fallback to memory:', e.message);
      }
    }
    const data = loadJsonStore();
    return (data.users || []).find(u =>
      (u.email && u.email.toLowerCase() === input) ||
      (u.username && u.username.toLowerCase() === input)
    ) || null;
  },

  async getUserById(id) {
    const pool = getPool();
    if (pool) {
      try {
        const [rows] = await pool.query('SELECT * FROM cms_users WHERE id = ?', [id]);
        if (rows.length > 0) {
          const user = rows[0];
          return {
            ...user,
            privileges: typeof user.privileges === 'string' ? JSON.parse(user.privileges) : (user.privileges || [])
          };
        }
      } catch (e) {
        console.warn('MySQL getUserById fallback:', e.message);
      }
    }
    const data = loadJsonStore();
    return (data.users || []).find(u => String(u.id) === String(id)) || null;
  },

  async createUser({ username, email, password, role = 'editor', privileges = [] }) {
    const hash = await bcrypt.hash(password, 10);
    const data = loadJsonStore();
    const maxId = (data.users || []).reduce((max, u) => Math.max(max, parseInt(u.id) || 0), 0);
    const newUser = {
      id: maxId + 1,
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hash,
      role,
      privileges: Array.isArray(privileges) ? privileges : [],
      createdAt: new Date().toISOString()
    };

    data.users.push(newUser);
    saveJsonStore(data);

    const pool = getPool();
    if (pool) {
      try {
        await pool.query(
          'INSERT INTO cms_users (username, email, password, role, privileges) VALUES (?, ?, ?, ?, ?)',
          [newUser.username, newUser.email, newUser.password, newUser.role, JSON.stringify(newUser.privileges)]
        );
      } catch (e) {
        console.warn('MySQL createUser sync notice:', e.message);
      }
    }

    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      privileges: newUser.privileges,
      createdAt: newUser.createdAt
    };
  },

  async updateUserPrivileges(id, privileges, role) {
    const data = loadJsonStore();
    const user = (data.users || []).find(u => String(u.id) === String(id));
    if (user) {
      user.privileges = Array.isArray(privileges) ? privileges : [];
      if (role) user.role = role;
      saveJsonStore(data);
    }

    const pool = getPool();
    if (pool) {
      try {
        if (role) {
          await pool.query('UPDATE cms_users SET privileges = ?, role = ? WHERE id = ?', [JSON.stringify(privileges), role, id]);
        } else {
          await pool.query('UPDATE cms_users SET privileges = ? WHERE id = ?', [JSON.stringify(privileges), id]);
        }
      } catch (e) {
        console.warn('MySQL updateUserPrivileges sync notice:', e.message);
      }
    }
    return user;
  },

  async deleteUser(id) {
    const data = loadJsonStore();
    const initialLen = data.users.length;
    data.users = data.users.filter(u => String(u.id) !== String(id) && u.role !== 'superadmin');
    saveJsonStore(data);

    const pool = getPool();
    if (pool) {
      try {
        await pool.query('DELETE FROM cms_users WHERE id = ? AND role != "superadmin"', [id]);
      } catch (e) {
        console.warn('MySQL deleteUser notice:', e.message);
      }
    }
    return data.users.length < initialLen;
  },

  // ── Form Submissions ───────────────────────────────────────────────────────
  async addSubmission(type, payload) {
    const data = loadJsonStore();
    if (!data.submissions) data.submissions = { contact: [], careers: [] };
    if (!data.submissions[type]) data.submissions[type] = [];

    const item = {
      id: Date.now(),
      ...payload,
      createdAt: new Date().toISOString()
    };
    data.submissions[type].unshift(item);
    if (data.submissions[type].length > 500) data.submissions[type].pop();
    saveJsonStore(data);
    return item;
  },

  async getSubmissions(type = null) {
    const pool = getPool();
    let contactRows = [];
    let careerRows = [];

    if (pool) {
      try {
        if (!type || type === 'contact') {
          const [rows] = await pool.query('SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 200');
          contactRows = rows.map(r => ({ ...r, type: 'contact' }));
        }
        if (!type || type === 'careers') {
          const [rows] = await pool.query('SELECT * FROM career_applications ORDER BY created_at DESC LIMIT 200');
          careerRows = rows.map(r => ({ ...r, type: 'career' }));
        }
      } catch (e) {
        console.warn('MySQL getSubmissions fallback:', e.message);
      }
    }

    const data = loadJsonStore();
    const localContact = (data.submissions?.contact || []).map(r => ({ ...r, type: 'contact' }));
    const localCareers = (data.submissions?.careers || []).map(r => ({ ...r, type: 'career' }));

    const contacts = contactRows.length > 0 ? contactRows : localContact;
    const careers = careerRows.length > 0 ? careerRows : localCareers;

    if (type === 'contact') return contacts;
    if (type === 'careers') return careers;
    return { contact: contacts, careers: careers, totalCount: contacts.length + careers.length };
  },

  // ── Traffic Analytics ──────────────────────────────────────────────────────
  logTraffic({ path: reqPath, ip, userAgent, referrer }) {
    if (reqPath.startsWith('/public') || reqPath.startsWith('/images') || reqPath.startsWith('/css') || reqPath.startsWith('/js') || reqPath.startsWith('/videos') || reqPath.startsWith('/fonts') || reqPath.startsWith('/admin')) {
      return;
    }

    const data = loadJsonStore();
    if (!data.traffic) data.traffic = [];

    data.traffic.push({
      path: reqPath,
      ip: ip ? ip.substring(0, 16) : '',
      referrer: referrer || '',
      time: Date.now()
    });

    // Keep last 10,000 hits in memory
    if (data.traffic.length > 10000) {
      data.traffic = data.traffic.slice(-10000);
    }
    saveJsonStore(data);

    const pool = getPool();
    if (pool) {
      pool.query(
        'INSERT INTO site_traffic (path, ip_hash, user_agent, referrer) VALUES (?, ?, ?, ?)',
        [reqPath, ip ? ip.substring(0, 32) : '', userAgent ? userAgent.substring(0, 255) : '', referrer ? referrer.substring(0, 255) : '']
      ).catch(() => {});
    }
  },

  getTrafficStats() {
    const data = loadJsonStore();
    const traffic = data.traffic || [];
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const totalViews = traffic.length;
    const views24h = traffic.filter(t => t.time >= oneDayAgo).length;
    const views7d = traffic.filter(t => t.time >= sevenDaysAgo).length;

    // Top visited pages
    const pathCounts = {};
    traffic.forEach(t => {
      pathCounts[t.path] = (pathCounts[t.path] || 0) + 1;
    });

    const topPages = Object.entries(pathCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, count]) => ({ path, count }));

    // Hourly distribution for last 24h
    const hourly = new Array(24).fill(0);
    traffic.filter(t => t.time >= oneDayAgo).forEach(t => {
      const hour = new Date(t.time).getHours();
      hourly[hour]++;
    });

    return {
      totalViews,
      views24h,
      views7d,
      topPages,
      hourly
    };
  }
};

module.exports = cmsStore;
