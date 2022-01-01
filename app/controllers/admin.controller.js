const db = require("../models/models");
const { Packages } = require("../utils/packages");
const {generatePdf} = require("../utils/email.controller")
const sql = require("../models/db.config");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

// generatePdf()
exports.adminDashboard = async (req, res) => {
  await db.getUserInfo((err, users, receipts, newletter, withResponse) => {
    if (err) return res.render("mainAdminTable", { err, error: req.flash("error") });
    else {
      res.render("mainAdminTable", {
        usersData: users,
        success: req.flash("adminAdded"),
        deletess: req.flash("adminDeleteProduct"),
        deletedUser: req.flash("deletedUsers"),
        title: "Registered dbs",
      });
    }
  });
};

exports.productsAndOrders = async (req, res) => {
  let forms = req.params.paths;
  let deletess;
  
  if (forms === "orders") {
    await sql.query(
      `SELECT paid_farmers.id, paid_farmers.quantity, paid_farmers.amount, paid_farmers.package,
       paid_farmers.others, paid_farmers.status, paid_farmers.deposit_date,
      product.category, product.imagesName, farmers.name AS farmerName, farmers.phone AS farmerNum, farmers.email AS farmerEmail,
      farmers.address AS farmerAddr, farmers.name AS buyerName, farmers.phone AS buyerNum, farmers.email AS buyerEmail,
      farmers.address AS buyerAddr FROM paid_farmers
      INNER JOIN product ON(paid_farmers.product_id=product.id)
      INNER JOIN farmers ON(paid_farmers.buyer_id = farmers.id)
       ORDER BY product.id DESC`,
      (error, results) => {
        if (error) {
          console.log(error);
          req.flash("error", "Server Error");
          res.redirect("back");
        } else {
          // console.log(results)
          res.render(`${forms}`, {
            results,
            success: req.flash("success"),
            error: req.flash("error"),
            deletess,
            deletedUser: req.flash("deletedUsers"),
            forms,
            title: `Orders`,
          });
        }
      }
    );
  }else{
    await sql.query(
      "SELECT *, product.id AS pid FROM product INNER JOIN farmers ON(farmers.id=product.farmer_id) ORDER BY product.id DESC",
      (error, results) => {
        if (error) {
          console.log(error);
          req.flash("error", "Server Error");
          res.redirect("back");
        } else {
          // console.log(results)
          res.render(`${forms}`, {
            results,
            success: req.flash("success"),
            error: req.flash("error"),
            deletess,
            deletedUser: req.flash("deletedUsers"),
            forms,
            title: `Product`,
          });
        }
      }
    );
  }
};

exports.adminProfileSettings = async (req, res) => {
  //console.log(req.user)
  let { MainAdmin } = req.user;
  sql.query(
    `SELECT email, first_name, last_name, number FROM admin WHERE id=?`,
    [MainAdmin],
    (err, output) => {
      if (err) {
        console.log(err);
        res.render("profile", {
          success: req.flash("adminAdded"),
          deletess: req.flash("adminDeleteProduct"),
          deletedUser: req.flash("deletedUsers"),
        });
      } else {
        
        res.render("profile", {
          user: output,
          success: req.flash("adminAdded"),
          deletess: req.flash("adminDeleteProduct"),
          deletedUser: req.flash("deletedUsers"),
        });
      }
    }
  );
};

exports.adminDeleteUserWithID = (req, res) => {
  db.adminDeleteUserWithID(
    parseInt(req.params.id),
    "farmers",
    (err, data) => {
      if (err) {
        console.log(err);
        req.flash("deletedUsers", "Network Error, Please Try Again");
        res.redirect("back");
      } else {
        req.flash("deletedUsers", "User deleted successfully");
        res.redirect("back");
      }
    }
  );
};


exports.product = (req, res) => {
  
  let user_id = req.user.user_id;
  let imageArray = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/JPG",
    "image/gif",
  ];
  let productArray = [
    "avocado",
    "beefruit",
    "bell pepper",
    "broccoli",
    "cabbage",
    "carrot",
    "chilli pepper",
    "irish potatoes",
    "kelly",
    "mushroom",
    "onions",
    "passion fruit",
    "pepper",
    "potatoes",
    "strawberry",
    "tillary",
    "tatashe",
    "tomatoes",
    "coli flower",
    "lettuce",
    "rose flower",

    "TOMATOES",
    "PEPPER",
    "CABBAGE",
    "CARROT",
    "TATASHE",
    "ONIONS",
    "GREEN BELL PEPPER",
    "LETTUCE",
    "IRISH POTATATOES",
    "CAULIFLOWER",
    "BROCCOLI",
    "BEETROOTS",
    "GREEN BEANS",
    "AVOCADO PEAR",
    "RED CHILLI",
    "PARSLEY",
    "KALE",
    "CELERY",
    "CHINESE CABBAGE",
    "EGGPLANT",
    "ICEBERG LETTUCE",
    "CHERRY TOMATOES",
    "MINT LEAF",
    "PURPLE CABBAGE", 
    "LEAK",

  ];

  let { category, weight, amt, desc, fullbag, halfbag, quaterbag} = req.body;
  if (!productArray.includes(category) || !req.body) {
    req.flash("error", "please select a valid category");
    return res.redirect("back");
  }
  if (!imageArray.includes(req.files.img.mimetype)) {
    req.flash("error", "please select a valid image file");
    return res.redirect("back");
  }
  let tableName =
    category.split(" ").length > 1 ? category.split(" ").join("_") : category;
  let imagesName = "productsImg/" + req.files.img.name;
  req.files.img.mv("public/productsImg/" + req.files.img.name);

  sql.query("INSERT INTO product(`farmer_id`, `category`, `desc`, `weight`, `amt`, `imagesName`, `fullbag`, `halfbag`, `quaterbag`) VALUES(?,?,?,?,?,?,?,?,?)",
    [1, tableName, desc, weight, amt, imagesName, fullbag, halfbag, quaterbag],
    (error, result) => {
      if (error) {
        console.log(error);
        req.flash("error", "Server Error");
        return res.redirect("back");
      } else {
        req.flash("success", "Products uploaded successfully");
        res.redirect("back");
      }
    }
  );
};


exports.adminDeleteProduct = (req, res) => {
  let forms = req.params.dbTable;
  let formID = parseInt(req.params.formID);
  let userID = parseInt(req.params.userID);
  let deletedUser;
  sql.query(
    `DELETE FROM ${forms} WHERE ${forms}.farmer_id=? AND ${forms}.id=?`,
    [userID, formID],
    (err, results) => {
      if (err) {
        console.log(err)
        req.flash("success", "Network Error, Try Again");
        res.redirect("back"); 
      } else {
        req.flash("success", "Product deleted Successfully");
        res.redirect("back");
      }
    }
  );
};


exports.deliveryStatus = (req, res) => {
  // Validate Request
  let { status, statusID } = req.body;
  if (!req.body) {
    req.flash("error", "Qantity can't be empty");
    return res.redirect("back");
  }

  db.deliveryStatus(parseInt(statusID), status, (err, data) => {
    if (err) {
      req.flash("error", "Server Error");
      return res.redirect("back");
    } else {
      req.flash("success", "Delivery Status changed successfully");
      return res.redirect("back");
    }
  });

};



exports.update = (req, res) => {
  
  let { fullbag, halfbag, quarterbag, desc } = req.body;

  if (!req.body) {
    req.flash("error", "Qantity can't be empty");
    return res.redirect("back");
  }

  db.updateById(parseInt(req.params.customerId), fullbag, halfbag, quarterbag, desc, (err, data) => {
    
    if (err) {
      req.flash("error", "Server Error");
      return res.redirect("back");
    }

    else {
      req.flash("success", "Product changed successfully");
      return res.redirect("back");
    }

  });

};










exports.logout = (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/adminlogin");
};


































































































exports.approveplan = async (req, res) => {
  var ref;

  let { receiptID, userID, packageplan } = req.params;

  let duration = parseInt(
    Packages[packageplan.split("$")[0]][
      packageplan.split("$")[1]
    ].Duration.split(" ")[0]
  );
  let deposit_date = new Date();
  let now = new Date();
  let due_Date_converter = now.setTime(
    now.getTime() + duration * 24 * 60 * 60 * 1000
  );
  let due_date = new Date(due_Date_converter);

  await sql.query(
    `SELECT ref FROM miningusers WHERE id=?`,
    [userID],
    async (err, output) => {
      if (err)
        console.log(err),
          req.flash("error", "network error"),
          res.redirect("back");
      else {
        for (var obj of output) {
          ref = parseInt(obj.ref); // The ID of the referal
        }
        if (isNaN(ref)) {
          await db.planStatusUpdate(
            userID,
            receiptID,
            deposit_date,
            due_date,
            async (err, result) => {
              if (err)
                return (
                  req.flash("error", "network error"), res.redirect("back")
                );
              return (
                req.flash("error", "Approved Successfuly"), res.redirect("back")
              );
            }
          );
        } else {
          console.log("**************************************6");
          await sql.query(
            `SELECT status, id, amount FROM receipts WHERE user_id = ? AND status=?`,
            [ref, "Active"],
            async (erro, solut) => {
              if (erro)
                console.log(erro),
                  req.flash("error", "network error"),
                  res.redirect("back");
              else {
                // console.log("Finding solut obj", solut);
                // console.log("Finding solut obj", solut[0]);
                if (Object.entries(solut).length > 0) {
                  var id, status, amount;
                  for (var obj = 0; obj < solut.length; obj++) {
                    id = solut[0].id;
                    status = solut[0].status;
                    amount = solut[0].amount;
                  }
                  let updatedmt =
                    (10 / 100) * parseInt(amount) + parseInt(amount);
                  await sql.query(
                    `UPDATE receipts SET amount=? WHERE id=? AND user_id=?`,
                    [updatedmt, id, ref],
                    async (err, ans) => {
                      if (erro)
                        console.log(erro),
                          req.flash("error", "network error"),
                          res.redirect("back");
                      else {
                        await db.planStatusUpdate(
                          userID,
                          receiptID,
                          deposit_date,
                          due_date,
                          async (err, result) => {
                            if (err)
                              return (
                                req.flash("error", "network error"),
                                res.redirect("back")
                              );
                            return (
                              req.flash("error", "Approved Successfuly"),
                              res.redirect("back")
                            );
                          }
                        );
                      }
                    }
                  );
                } else {
                  await db.planStatusUpdate(
                    userID,
                    receiptID,
                    deposit_date,
                    due_date,
                    async (err, result) => {
                      if (err)
                        return (
                          req.flash("error", "network error"),
                          res.redirect("back")
                        );
                      return (
                        req.flash("error", "Approved Successfuly"),
                        res.redirect("back")
                      );
                    }
                  );
                }
              }
            }
          );
        }
      }
    }
  );
};

exports.removeUser = async (req, res) => {
  let { id } = req.params;
  await db.deleteUser(parseInt(id), (err, output) => {
    if (err) return req.flash("error", "network error"), res.redirect("back");
    return (
      req.flash("error", "User Successfully Deleted"), res.redirect("back")
    );
  });
};

exports.removemsg = async (req, res) => {
  let { id } = req.params;
  await db.removemsg(parseInt(id), (err, output) => {
    if (err) return req.flash("error", "network error"), res.redirect("back");
    return (
      req.flash("error", "Email Successfully Deleted"), res.redirect("back")
    );
  });
};

exports.deletePlans = async (req, res) => {
  let { planID, userID } = req.params;
  await db.deletePlan(parseInt(planID), parseInt(userID), (err, output) => {
    if (err) return req.flash("error", "network error"), res.redirect("back");
    return req.flash("error", "Successfully Deleted"), res.redirect("back");
  });
};

exports.deleteApprovedWithdrawal = async (req, res) => {
  let { planID, userID } = req.params;
  await db.deleteApprovedWithdrawal(parseInt(planID), parseInt(userID), (err, output) => {
    if (err) return req.flash("error", "network error"), res.redirect("back");
    return req.flash("error", "Successfully Deleted"), res.redirect("back");
  });
};

exports.approvedWithdrawal = async (req, res) => {
  let { username, email, wallet, roi, receiptID, user_id } = req.params;
  console.log("THe amout of money ti vbe added inio the aiwht ida ", roi)
  await sql.query("SELECT withdraw_req, ref_amt, amount FROM receipts WHERE id=? AND user_id=?", [parseInt(receiptID), parseInt(user_id) ], async (err, results)=>{
    if(err) return console.log(err), req.flash("error", "Network Error"), res.redirect("back");
    else{
      let { withdraw_req, amount, ref_amt } = results[0]
      if(parseInt(ref_amt) == 0){
        ref_amt = amount
      }
      let addedWithdraw = parseInt(withdraw_req)  + parseInt(roi);
      let reducedCapital = (parseInt(amount) - parseInt(roi))
      console.log(`${username} REQUESTED FOR A WITHDRAW WITH THE AMOUNT OF ${roi}`)
      let userObject = {
        username, email, wallet, roi  
      }
     
          await generatePdf(userObject, async (err, result)=>{
            if(err) return console.log(err), req.flash("error", "Network Error !, please connect to good network and try again"), res.redirect("back");
            else{

              await sql.query("UPDATE receipts SET  amount=?, withdraw_req=?, ref_amt=? WHERE id=? AND user_id=?", [reducedCapital, 
                addedWithdraw, ref_amt, parseInt(receiptID), parseInt(user_id)], async (erro, result)=>{
                  if(err) return console.log("Error occured when updating users request", erro), req.flash("error", "Network Error"), res.redirect("back");
                  return req.flash("error", "Email Receipts Sent Successfuly"), res.redirect("back");
            })
            }

        })
    }


  })

  


};

exports.changePassword= async(req, res)=>{

  let {admin_id} = req.user;
  let {email, password, newPassword} = req.body;

  const encryptedPassword = await bcrypt.hash(newPassword, saltRounds);
   await db.adminEmailValidate(email, admin_id, async (err, result)=>{
     if(err) return (req.flash("error", "Incorrect details"), res.redirect("back"))
     else{
       if(result.length > 0){
        const hash = result[0].password.toString();
        bcrypt.compare(password, hash, async function (err, response) {
            if (response === true) {
               await db.updateAdminPassword(encryptedPassword, admin_id, (err, outcome)=>{
                 err ? (req.flash("error", "Network Error"), res.redirect("back")) : (req.flash("error", "Password changed successfuly"), res.redirect("back"))
               })
            }
            else { return (req.flash("error", "Incorrect Password" ), res.redirect("back")) }
        })
       }else return (req.flash("error", "Incorrect Email"), res.redirect("back"))
     }
   });
   
}


