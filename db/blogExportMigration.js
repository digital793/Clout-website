'use strict';

const fs = require('fs');
const path = require('path');

const BLOG_EXPORT_DIR = path.join(__dirname, '..', 'public', 'blogs');
const BLOG_EXPORT_MIGRATION_VERSION = 1;

function decodeHtml(value) {
  return value
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)));
}

function plainText(value) {
  return decodeHtml(value
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

function inlineMarkdown(value) {
  let text = value
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<(strong|b)\b[^>]*>/gi, '**')
    .replace(/<\/(strong|b)\s*>/gi, '**')
    .replace(/<(em|i)\b[^>]*>/gi, '_')
    .replace(/<\/(em|i)\s*>/gi, '_');
  text = text.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a\s*>/gi, (_match, href, label) => {
    const safeHref = /^(https?:\/\/|\/(?!\/)|#|mailto:)/i.test(href)
      ? href
      : '';
    const linkText = decodeHtml(label.replace(/<[^>]*>/g, '')).trim();
    return safeHref ? `[${linkText}](${safeHref})` : linkText;
  });
  return decodeHtml(text.replace(/<[^>]*>/g, ''))
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();
}

function contentWrapper(html) {
  const wrapper = /<div\b(?=[^>]*\bclass=["'][^"']*uui-blogpost04_content-wrapper)[^>]*>/i;
  const opening = wrapper.exec(html);
  if (!opening) return '';

  const innerStart = opening.index + opening[0].length;
  const divTags = /<\/?div\b[^>]*>/gi;
  divTags.lastIndex = innerStart;
  let depth = 1;

  for (let match; (match = divTags.exec(html));) {
    depth += /^<div\b/i.test(match[0]) ? 1 : -1;
    if (depth === 0) return html.slice(innerStart, match.index);
  }

  return '';
}

function publicImageUrl(source) {
  if (!source || /^(?:https?:|data:|\/\/)/i.test(source)) return '';
  const imagePath = source.replace(/^[./]+/, '');
  if (!imagePath.startsWith('images/')) return '';
  const absolute = path.resolve(path.join(__dirname, '..', 'public'), imagePath);
  const publicRoot = path.resolve(path.join(__dirname, '..', 'public')) + path.sep;
  if (!absolute.startsWith(publicRoot) || !fs.existsSync(absolute)) return '';
  return `/${imagePath.replace(/\\/g, '/')}`;
}

function articleMarkdown(html) {
  const body = contentWrapper(html)
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style\s*>/gi, '');
  if (!body) return '';

  const output = [];
  const blocks = /<(h[2-6]|p|li|blockquote)\b[^>]*>([\s\S]*?)<\/\1\s*>|<img\b[^>]*>/gi;
  for (let match; (match = blocks.exec(body));) {
    if (match[1]) {
      const text = inlineMarkdown(match[2]);
      if (!text) continue;
      switch (match[1].toLowerCase()) {
        case 'li':
          output.push(`- ${text.replace(/\n/g, '\n  ')}`);
          break;
        case 'blockquote':
          output.push(text.split('\n').map(line => `> ${line}`).join('\n'));
          break;
        case 'p':
          output.push(text);
          break;
        default:
          output.push(`## ${text}`);
      }
      continue;
    }

    const source = (match[0].match(/\bsrc=["']([^"']+)["']/i) || [])[1];
    const alt = (match[0].match(/\balt=["']([^"']*)["']/i) || [])[1] || '';
    const imageUrl = publicImageUrl(source);
    if (imageUrl) output.push(`![${plainText(alt)}](${imageUrl})`);
  }

  return output.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

function articleMetadata(html, slug) {
  const wrapperMatch = /<div\b(?=[^>]*\bclass=["'][^"']*uui-blogpost04_content-wrapper)[^>]*>/i.exec(html);
  const header = wrapperMatch ? html.slice(0, wrapperMatch.index) : html;
  const titleMatch = /<h5\b[^>]*class=["'][^"']*\bh5-heading\b[^"']*["'][^>]*>([\s\S]*?)<\/h5\s*>/i.exec(header);
  const paragraphMatch = /<p\b[^>]*class=["'][^"']*\bparagraph-large\b[^"']*["'][^>]*>([\s\S]*?)<\/p\s*>/i.exec(header);
  const descriptionMatch = /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i.exec(html);
  const titleTag = (/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html) || [])[1] || slug.replace(/-/g, ' ');
  const dateMatch = /Last Published:\s*\w+\s+(\w{3}\s+\d{1,2}\s+\d{4})/i.exec(html);
  const publishedDate = dateMatch && !Number.isNaN(Date.parse(dateMatch[1]))
    ? new Date(dateMatch[1]).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const coverMatch = /<div\b[^>]*class=["'][^"']*uui-blogpost04_image-wrapper[^"']*["'][^>]*>[\s\S]*?<img\b[^>]*\bsrc=["']([^"']+)["']/i.exec(html);

  return {
    title: plainText(titleMatch ? titleMatch[1] : titleTag.replace(/\s*\|\s*Cloutgency\s*$/i, '')),
    excerpt: plainText(paragraphMatch ? paragraphMatch[1] : (descriptionMatch || [])[1] || ''),
    publishedAt: publishedDate,
    readTime: '5 min read',
    coverImage: publicImageUrl(coverMatch && coverMatch[1]) || '/images/og-image.jpg'
  };
}

function migrateBlogsFromWebflow(data) {
  if (data.blogContentMigrationVersion >= BLOG_EXPORT_MIGRATION_VERSION) return false;
  if (!Array.isArray(data.blogs)) data.blogs = [];
  if (!fs.existsSync(BLOG_EXPORT_DIR)) return false;

  const exportFiles = fs.readdirSync(BLOG_EXPORT_DIR)
    .filter(file => file.endsWith('.html'))
    .sort();
  if (exportFiles.length === 0) return false;

  const existingBySlug = new Map(data.blogs.map(blog => [blog.slug, blog]));
  let nextId = data.blogs.reduce((max, blog) => Math.max(max, Number(blog.id) || 0), 0) + 1;
  let importedCount = 0;

  for (const file of exportFiles) {
    const slug = path.basename(file, '.html');
    const html = fs.readFileSync(path.join(BLOG_EXPORT_DIR, file), 'utf8');
    const content = articleMarkdown(html);
    if (!content) {
      console.warn(`✦ CMS: Could not extract article body from ${file}; leaving its CMS record unchanged`);
      continue;
    }

    const existing = existingBySlug.get(slug);
    if (existing) {
      existing.content = content;
      existing.isPublished = true;
      continue;
    }

    const metadata = articleMetadata(html, slug);
    const item = {
      id: nextId++,
      slug,
      author: 'Cloutgency',
      tags: [],
      isPublished: true,
      sortOrder: nextId - 1,
      ...metadata,
      content
    };
    data.blogs.push(item);
    existingBySlug.set(slug, item);
    importedCount += 1;
  }

  data.blogContentMigrationVersion = BLOG_EXPORT_MIGRATION_VERSION;
  console.log(`✦ CMS: Imported original article content for ${existingBySlug.size} blogs (${importedCount} new records)`);
  return true;
}

module.exports = { migrateBlogsFromWebflow };
