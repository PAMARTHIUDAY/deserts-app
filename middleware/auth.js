function requireAdmin(req, res, next) {
  if (req.session?.isAdmin) return next();
  res.redirect("/admin/login");
}
module.exports = { requireAdmin };
