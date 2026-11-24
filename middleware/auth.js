'use strict';

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    if (req.xhr || req.headers.accept?.indexOf('json') > -1 || req.path.startsWith('/api')) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Please log in' });
    }
    return res.redirect(`/admin/login?returnUrl=${encodeURIComponent(req.originalUrl)}`);
  }
  res.locals.currentUser = req.session.user;
  next();
}

function requirePrivilege(privilege) {
  return function (req, res, next) {
    if (!req.session || !req.session.user) {
      if (req.xhr || req.headers.accept?.indexOf('json') > -1 || req.path.startsWith('/api')) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Please log in' });
      }
      return res.redirect('/admin/login');
    }

    const user = req.session.user;
    const isSuperAdmin = user.role === 'superadmin';
    const hasPrivilege = isSuperAdmin || (Array.isArray(user.privileges) && user.privileges.includes(privilege));

    if (!hasPrivilege) {
      if (req.xhr || req.headers.accept?.indexOf('json') > -1 || req.path.startsWith('/api')) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: You do not have the required privilege [${privilege}] to perform this action.`
        });
      }
      return res.status(403).render('admin/access_denied', {
        title: 'Access Denied — Cloutgency CMS',
        requiredPrivilege: privilege,
        user
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requirePrivilege
};
