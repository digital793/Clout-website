'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDir = path.join(__dirname, '..', 'public', 'images', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.mp4', '.webm', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: jpg, jpeg, png, webp, svg, gif, mp4, webm, pdf'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max (supports video snippets & high-res images)
  fileFilter
});

function createWorkUpload(type) {
  const isImage = type === 'image';
  const uploadDir = path.join(
    __dirname,
    '..',
    'public',
    isImage ? 'images' : 'videos',
    'works'
  );
  const allowedTypes = isImage
    ? new Map([
      ['.jpg', 'image/jpeg'],
      ['.jpeg', 'image/jpeg'],
      ['.png', 'image/png'],
      ['.webp', 'image/webp'],
      ['.gif', 'image/gif']
    ])
    : new Map([
      ['.mp4', 'video/mp4'],
      ['.webm', 'video/webm']
    ]);

  fs.mkdirSync(uploadDir, { recursive: true });

  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadDir),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const base = path.basename(file.originalname, ext)
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 80) || 'work-asset';
        cb(null, `${base}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
      }
    }),
    limits: { fileSize: isImage ? 20 * 1024 * 1024 : 200 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.get(ext) === file.mimetype) return cb(null, true);
      cb(new Error(isImage
        ? 'Upload a JPG, PNG, WebP, or GIF image.'
        : 'Upload an MP4 or WebM video.'));
    }
  });
}

function createBlogImageUpload() {
  const uploadDir = path.join(__dirname, '..', 'public', 'images', 'blogs');
  const allowedTypes = new Map([
    ['.jpg', 'image/jpeg'],
    ['.jpeg', 'image/jpeg'],
    ['.png', 'image/png'],
    ['.webp', 'image/webp'],
    ['.gif', 'image/gif']
  ]);

  fs.mkdirSync(uploadDir, { recursive: true });

  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadDir),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const base = path.basename(file.originalname, ext)
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 80) || 'blog-cover';
        cb(null, `${base}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
      }
    }),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.get(ext) === file.mimetype) return cb(null, true);
      cb(new Error('Upload a JPG, PNG, WebP, or GIF cover image.'));
    }
  });
}

upload.createWorkUpload = createWorkUpload;
upload.createBlogImageUpload = createBlogImageUpload;

module.exports = upload;
