'use strict';

const cmsStore = require('../db/cmsStore');

function trafficTracker(req, res, next) {
  // Only track GET requests for web pages
  if (req.method === 'GET' && !req.path.startsWith('/admin') && !req.path.startsWith('/api') && !req.path.includes('.')) {
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || '';
      const referrer = req.headers['referer'] || '';
      cmsStore.logTraffic({
        path: req.path,
        ip,
        userAgent,
        referrer
      });
    } catch (err) {
      // Non-blocking
    }
  }
  next();
}

module.exports = trafficTracker;
