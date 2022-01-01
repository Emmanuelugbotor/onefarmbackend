exports.autheticationMiddleware = () => {
  return (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
  };
};

exports.adminMiddleWare = () => {
  return (req, res, next) => {
    if (req.user && req.isAuthenticated()) {
      if (req.user.admin_id && req.isAuthenticated()) {
        return next();
      } else {
        res.redirect("/");
      }
    } else {
      res.redirect("/");
    }
  };
};

exports.usersAuthRoutes = (app) => (paths, autheticationMiddleware, routes) => {
  return (
    app.post(paths, autheticationMiddleware, routes),
    app.get(paths, autheticationMiddleware, routes)
  )
};

exports.adminAuthRoutes = (app) => (paths, adminMiddleWare, routes) => {
  return (
    app.post(paths, adminMiddleWare(), routes),
    app.get(paths, adminMiddleWare(), routes)
    )
};