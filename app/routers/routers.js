require("../utils/passport");
const passport = require("passport");
const usersRoutes = require("../controllers/user.controller");
const adminRoutes = require("../controllers/admin.controller");
const { autheticationMiddleware, adminMiddleWare } = require("../utils/auth");
const { usersAuthRoutes, adminAuthRoutes } =  require("../utils/auth");
const { isAuth } =  require("../utils/token");

const Routers = (app) => {
  return (routers = (paths, filename) => {

    //FARMERS API ENDPOINTS
    app.post("/farmer_register", usersRoutes.RegisterUser);
    app.post("/farmer_login", usersRoutes.LoginUser);


    app.get("/getProducts", usersRoutes.ReadProduct);
    app.post("/orders", isAuth, usersRoutes.buyerCheckout);
    app.post("/resetPassword", usersRoutes.resetPassword)
    app.post("/resetPasswordOtpCode", usersRoutes.resetPasswordOtpCode)
    app.post("/newPassword", usersRoutes.newPassword);
    app.post("/contactSubmit", usersRoutes.contactSubmit);
    app.get("/refID/:ref", (req, res)=>res.redirect("/"));

    
    
    app.get(paths, (req, res) => res.render(filename, { error: req.flash("error"), success: req.flash("success"), isAuthenticated: (req.isAuthenticated() && req.user.user_id) }));
    app.post("/MainAdminLogin", passport.authenticate("admin", { successRedirect: "/adminDashboard",    failureRedirect: "/adminlogin", failureFlash: true, successFlash: true, })
    );
  });
}

const userAuthRouters = (app) => (routers = (paths, filename) => usersAuthRoutes(app)(paths, isAuth, usersRoutes[filename]));
const adminAuthRouter = (app) => (routers = (paths, filename) => adminAuthRoutes(app)(paths, adminMiddleWare, adminRoutes[filename]))

module.exports = (app) => {

  Routers(app)("/adminlogin", "mainAdminLogin");


  // FARM AUTH ROUTERS
  userAuthRouters(app)("/dashboard", "dashboard", usersRoutes);
  userAuthRouters(app)("/addProduct", "addProduct", usersRoutes);
  userAuthRouters(app)("/getProduct", "getProduct", usersRoutes);
  userAuthRouters(app)("/deleteProduct/:id", "deleteProduct", usersRoutes);
  userAuthRouters(app)("/changedetails", "changedetails", usersRoutes);
  userAuthRouters(app)("/usersEditEmail", "usersEditEmail", usersRoutes);
  userAuthRouters(app)("/usersEditPass", "usersEditPass", usersRoutes);


  userAuthRouters(app)("/orders", "buyerCheckout", usersRoutes);
  userAuthRouters(app)("/resetEmail", "resetEmail", usersRoutes);
  userAuthRouters(app)("/resetPass", "resetPass", usersRoutes);


  userAuthRouters(app)("/logout", "logout", usersRoutes);
  userAuthRouters(app)("/setting", "setting", usersRoutes);
  userAuthRouters(app)("/mining/:id", "MiningPlans", usersRoutes);
  userAuthRouters(app)("/paymemtamt", "paymemtamt", usersRoutes)
  userAuthRouters(app)("/runningPlans", "runningPlans", usersRoutes)
  userAuthRouters(app)('/removeplan/:id',"DeletePlan", usersRoutes)
  userAuthRouters(app)('/withdrawal',"withdrawal", usersRoutes)
  userAuthRouters(app)("/finalPayment", "MiningReceipts", usersRoutes);
  userAuthRouters(app)("/withdrawalRequest", "withdrawalRequest", usersRoutes);
  userAuthRouters(app)("/changePassword", "changePassword", usersRoutes);
  userAuthRouters(app)("/withdrawalUpdate/:id/:userID/:roi/:deposit", "withdrawalUpdate", usersRoutes);
  

  adminAuthRouter(app)("/product", "product", adminRoutes);
  adminAuthRouter(app)("/MainAdminLogout", "logout", adminRoutes);
  adminAuthRouter(app)("/adminDashboard", "adminDashboard", adminRoutes);
  adminAuthRouter(app)("/admin/:paths", "productsAndOrders", adminRoutes);
  adminAuthRouter(app)("/adminProfileSettings", "adminProfileSettings", adminRoutes);
  adminAuthRouter(app)("/adminDeleteUser/:id", "adminDeleteUserWithID", adminRoutes);
  adminAuthRouter(app)("/addDelivery", "deliveryStatus", adminRoutes);
  adminAuthRouter(app)("/adminDeleteProduct/:dbTable/:formID/:userID", "adminDeleteProduct", adminRoutes);
  adminAuthRouter(app)("/editPrice/:customerId", 'update', adminRoutes);
  
  adminAuthRouter(app)("/removeuser/:id", "removeUser", adminRoutes)
  adminAuthRouter(app)("/removemsg/:id", "removemsg", adminRoutes)
  adminAuthRouter(app)("/approveplan/:receiptID/:userID/:packageplan", "approveplan", adminRoutes)
  adminAuthRouter(app)("/deletePlans/:planID/:userID", "deletePlans", adminRoutes)
  adminAuthRouter(app)("/deleteApprovedWithdrawal/:planID/:userID", "deleteApprovedWithdrawal", adminRoutes)
  adminAuthRouter(app)("/approvedWithdrawal/:username/:email/:wallet/:roi/:receiptID/:user_id", "approvedWithdrawal", adminRoutes)
  adminAuthRouter(app)("/adminChangePassword", "changePassword", adminRoutes);
  
};