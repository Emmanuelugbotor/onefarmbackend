const db = require("../models/models");
const sql = require("../models/db.config");
const bcrypt = require("bcryptjs");
const request = require("request");
const { Register } = require("../utils/registerValidate");
const { Packages, imageParams, withdrawalDB } = require("../utils/packages");
const { sendOtp } = require("../utils/email.controller");
const {
  packagesPlans,
  validateWithdrawalRequest,
} = require("../utils/runningPlans");
const { data } = require("../models/models");
const { generateToken } = require("../utils/token");
var saltRounds = 10;
let { generatePdf, sendAdminReceipt } = require("../utils/email.controller");

// FARMERS SECTIONS

exports.RegisterUser = async (req, res) => {
  if (Object.entries(req.body).length == 0)
    return res.status(500).send({ error: "Provide valid user details" });
  if (!req.body.password)
    return res.status(500).send({ error: "Kindly enter a valid password" });
  else {
    const password = req.body.password;
    const encryptedPassword = await bcrypt.hash(password, saltRounds);
    let userInfo = {
      email: req.body.email,
      name: req.body.fullname,
      phone: req.body.number,
      password: encryptedPassword,
      address: req.body.address, // optional field
      // repeat_password: encryptedPassword,
    };

    req.body.fullname.split(" ").join("");
    let { error } = Register(req.body);
    if (error)
      return (
        console.log(error),
        res.status(500).send({ error: error.details[0]["message"] })
      );
    else {
      await db.selectByOne(
        "farmers",
        "email",
        userInfo.email,
        async (err, result) => {
          console.log("result", result);
          if (err) {
            res.status(500).send({ error: "Network Error" });
          } else if (!Object.entries(result).length == 0) {
            res.status(500).send({ error: "email already exist" });
          } else {
            await db.insertUsers("farmers", userInfo, (err, result) => {
              if (err) {
                console.log(err);
                res.status(500).send({ error: "Network Error, try again" });
              } else {
                console.log(result.insertId);
                let userRegObj = {
                  id: result.insertId,
                  email: req.body.email,
                  name: req.body.fullname,
                  phone: req.body.number,
                };
                res.status(200).send({
                  id: result.insertId,
                  email: req.body.email,
                  name: req.body.fullName,
                  phone: req.body.number,
                  token: generateToken(userRegObj),
                });
              }
            });
          }
        }
      );
    }
  }
};

exports.LoginUser = async (req, res) => {
  let { email, password } = req.body;

  await db.loginSelect("farmers", "email", email, async (err, result) => {
    if (err)
      console.log(err), res.status(400).send({ error: "Network Error." });
    else {
      if (result.length > 0) {
        const hash = result[0].password.toString();
        bcrypt.compare(password, hash, function (err, response) {
          if (response === true) {
            res.status(200).send({
              id: result[0].id,
              email: result[0].email,
              name: result[0].name,
              phone: result[0].phone,
              token: generateToken(result[0]),
            });
          } else {
            res.status(400).send({ error: "Incorrect email  or password" });
          }
        });
      } else {
        res.status(400).send({ error: "Incorrect email  or password" });
      }
    }
  });
};

exports.dashboard = (req, res) => {
  let { id } = req.user;
  let totalProduct = 0;
  let pendingOrders = 0;
  let deliveredOrders = 0;

  db.usersDashboard(id, (err, product) => {
    for (var i = 0; i < product.length; i++) {
      totalProduct++;
      if (product[i].status == "Pending") pendingOrders++;
      if (product[i].status == "Delivered") deliveredOrders++;
    }

    if (err) {
      console.log(err);
      res.status(400).send({ error: "Network Error" });
    } else {
      console.log(product);
      res
        .status(200)
        .send({ product, totalProduct, pendingOrders, deliveredOrders });
    }
  });
};

exports.addProduct = (req, res) => {

  console.log("Req ", req.body)
  console.log(req.files)

  if (Object.entries(req.body).length == 0)
    return res.status(500).send({ msg: "Provide valid details" });

  let { id } = req.user;
  

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
  ];

  let { category, weight, amt, desc, fullbag, halfbag, quaterbag } = req.body;

  if (!productArray.includes(category) || !req.body)
    return res.status(400).send({ error: "please select a valid category" });
  if (!imageArray.includes(req.files.img.mimetype))
    return res.status(400).send({ error: "please select a image file" });

  let tableName =
    category.split(" ").length > 1 ? category.split(" ").join("_") : category;
  let imagesName = "productsImg/" + req.files.img.name;
  req.files.img.mv("public/productsImg/" + req.files.img.name); 

  sql.query(
    "INSERT INTO product(`farmer_id`, `category`, `desc`, `weight`, `amt`, `imagesName`, `fullbag`, `halfbag`, `quaterbag`) VALUES(?,?,?,?,?,?,?,?,?)",
    [id, tableName, desc, weight, amt, imagesName, fullbag, halfbag, quaterbag],
    (error, result) => {
      if (error) {
        console.log(error);
        return res.status(404).send({ error: "Network Error, try again" });
      } else {
        return res.status(200).send({ msg: "Products uploaded successfully" });
      }
    }
  );

};

exports.getProduct = (req, res) => {
  let { id } = req.user;

  sql.query(
    "SELECT * FROM  product WHERE farmer_id = ?",
    [id],
    (error, result) => {
      if (error) {
        console.log(error);
        return res.send({ msg: "Network Error, try again" });
      } else {
        return res.send({ result });
      }
    }
  );
};

exports.deleteProduct = (req, res) => {
  let { id } = req.user;
  let product_id = parseInt(req.params.id);
  if (isNaN(product_id) || isNaN(id))
    return res.send({ msg: "Please enter a valid params" });

  sql.query(
    "DELETE FROM product WHERE farmer_id = ? AND id = ?",
    [id, product_id],
    (error, result) => {
      if (error) {
        console.log(error);
        return res.send({ msg: "Network Error, try again" });
      } else {
        return res.send({ msg: "Product deleted successfully" });
      }
    }
  );
};

exports.ReadProduct = async (req, res) => {
  let resultObj = {};
  await db.selectAll("product", (error, result) => {
    for (let i = 0; i < result.length; i++) {
      result[i].name = result[i].category;
      result[i].price = result[i].amt;
      result[i].image = result[i].imagesName;
      result[i].countInStock = 5;
      // result[i].qty = 5
    }

    if (error) return console.log(error), res.status(400).send({});
    return res.status(200).send({ items: result });
  });
};

exports.logout = (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
};

exports.usersEditEmail = async (req, res) => {
  console.log(req.body);
  let { new_email } = req.body;
  let { id, email } = req.user;

  let otp = Math.round(Math.random() * 100000000);
  let userDbEmail;

  sql.query(
    `SELECT email FROM farmers WHERE id = ?`,
    [id],
    async (errors, output) => {
      for (var i in output) {
        userDbEmail = output[i].email;
      }
      if (errors) {
        console.log(errors);
        return res.status(400).send({ error: "Network error, try again." });
      }
      if (userDbEmail !== email) {
        return res
          .status(400)
          .send({ error: "previous email you entered is incorrect" });
      } else {
        await db.validateViaEmail(new_email, async (err, emailData) => {
          if (err) {
            console.log(err);
            return res.status(400).send({ error: "Network error, try again." });
          }
          if (emailData.email && emailData.email == new_email) {
            // console.log("GOT HERE")
            return res.status(400).send({ error: "This Email already exist" });
          } else {
            await sendOtp(email, otp, (emailErr, emailRes) => {
              if (emailRes) {
                sql.query(
                  `UPDATE farmers SET otp=? WHERE id=?`,
                  [otp, id],
                  (err, result) => {
                    if (err) {
                      console.log(err);
                      return res
                        .status(400)
                        .send({ error: "Network error, try again." });
                    } else {
                      return res.status(200).send({
                        msg: "An OTP code has been sent to your email",
                        new_email,
                      });
                    }
                  }
                );
              } else {
                return res
                  .status(400)
                  .send({ error: "Network error, try again." });
              }
            });
          }
        });
      }
    }
  );
};



exports.changedetails = async (req, res) => {
  // console.log(req.body);
  if (Object.entries(req.body).length == 0 || !req.body)
    return res.send({ msg: "Kindly provide a valid detail" });
  let { name, phone, email, address } = req.body;
  let { id } = req.user;

  let auth = {
    id: id,
    email: email,
    name: name,
    phone: phone,
    address: address,
  };

  sql.query(
    `UPDATE farmers SET ? WHERE id=?`,
    [req.body, id],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(400).send({ error: "Network error, try again." });
      } else {
        return res.status(200).send({
          id: id,
          email: email,
          name: name,
          phone: phone,
          address: address,
          token: generateToken(auth),
          msg: "Details changed successfully.",
        });
      }
    }
  );
};

exports.usersEditPass = async (req, res) => {
  console.log(req.body);
  let { new_Pass } = req.body;
  let { id, email } = req.user;
  let otp = Math.round(Math.random() * 100000000);

  await sendOtp(email, otp, (emailErr, emailRes) => {
    if (emailRes) {
      sql.query(
        `UPDATE farmers SET otp=? WHERE id=?`,
        [otp, id],
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(400).send({ error: "Network error, try again." });
          } else {
            return res.status(200).send({
              msg: "An OTP code has been sent to your email",
              new_Pass,
            });
          }
        }
      );
    } else {
      return res.status(400).send({ error: "Network error, try again." });
    }
  });
};

exports.resetEmail = async (req, res) => {
  let hashPassword;

  let { id } = req.user;
  let { new_email, otpCode } = req.body;

  await sql.query(
    `SELECT id, email, name, phone, otp FROM farmers WHERE id=?`,
    [id],
    async (err, result) => {
      if (result[0].otp == parseInt(otpCode)) {
        await sql.query(
          `UPDATE farmers SET email=? WHERE id=?`,
          [new_email, id],
          async (errs, resp2) => {
            if (errs) {
              console.log(errs);
              return res
                .status(400)
                .send({ error: "Network Error, try again." });
            } else {
              return res.status(200).send({
                id: result[0].id,
                email: new_email,
                name: result[0].name,
                phone: result[0].phone,
                token: generateToken(result[0]),
                msg: "Email changed successfully.",
              });
            }
          }
        );
      } else {
        return res.status(400).send({ error: "Invalid OTP code" });
      }
    }
  );
};

exports.resetPass = async (req, res) => {
  let { id } = req.user;
  let { new_Pass, otpCode } = req.body;

  await sql.query(
    `SELECT id, email, name, phone, otp FROM farmers WHERE id=?`,
    [id],
    async (err, result) => {
      if (result[0].otp == parseInt(otpCode)) {
        await bcrypt.hash(new_Pass, saltRounds, async function (err, hash) {
          if (err)
            console.log(err),
              res.status(400).send({ error: "Network Error, try again." });
          else {
            await sql.query(
              `UPDATE farmers SET password=? WHERE id=?`,
              [hash, id],
              async (errs, resp2) => {
                if (errs) {
                  console.log(errs);
                  return res
                    .status(400)
                    .send({ error: "Network Error, try again." });
                } else {
                  return res.status(200).send({
                    id: result[0].id,
                    email: result[0].email,
                    name: result[0].name,
                    phone: result[0].phone,
                    token: generateToken(result[0]),
                    msg: "Password changed successfully.",
                  });
                }
              }
            );
          }
        });
      } else return res.status(400).send({ error: "Invalid OTP code" });
    }
  );
};

exports.buyerCheckout = async (req, res) => {
  console.log("FLW REPONSE FROMT THE REACT SIDE", req.body);
  let { email, name } = req.user;
  let userID = req.user.id;
  var obj = req.body.response;
  var amount = parseInt(obj.amount);
  let cartOrderObj = req.body.cartItems;
  let buyerID = userID;
  let product_id = cartOrderObj[0].product;
  var package = "";
  var quantity = parseInt(cartOrderObj[0].qty);
  let flutterWaveReturnedObject;
  var transID = obj.transaction_id;
  let buyerAddress = "";

  let options = {
    method: "GET",
    url: `https://api.flutterwave.com/v3/transactions/${transID}/verify`,
    headers: {
      "content-type": "application/json",
      authorization: "FLWSECK-db2f2e4a8e3ceecd9d5e7dc73bf899d3-X",
    },
  };

  // authorization: "FLWSECK-db2f2e4a8e3ceecd9d5e7dc73bf899d3-X",

  // authorization: "FLWSECK_TEST-92366ffe2edb0cb5cfdf4c5eaabdaf6c-X",

  await request(options, async (err, response) => {
    flutterWaveReturnedObject = JSON.parse(response.body);
    buyerAddress = flutterWaveReturnedObject.data.meta.ShippingAddress;

    console.log("MEMBERSHIP FEE RES ", flutterWaveReturnedObject);
    let deposit_date = new Date();

    if (flutterWaveReturnedObject.data.status == "successful") {
      if (
        flutterWaveReturnedObject.data.amount == amount ||
        flutterWaveReturnedObject.data.amount > amount
      ) {
        if (cartOrderObj.length > 1) {
          cartOrderObj.forEach(async (element) => {
            await db.buerValidateInsert(
              buyerID,
              element.id,
              1,
              element.sellingPrice,
              package,
              deposit_date,
              "Pending",
              buyerAddress,
              async (err, data) => {
                if (err) {
                  console.log(err);
                  return res.status(404).send({
                    error:
                      "You have a slow network connection, please try again ",
                  });
                }
              }
            );
          });

          await sendAdminReceipt(
            "info@onefarmtech.com",
            name,
            cartOrderObj,
            async (err, ans) => {
              if (err) {
                console.log(err);
              }
            }
          );
          await generatePdf(
            email,
            name,
            cartOrderObj,
            async (errorsP, resP) => {
              if (errorsP) {
                console.log(errorsP);
              }
            }
          );

          return res.status(200).send({
            msg: "Your payment was successful and you will be contacted within 24 hrs",
          });
        } else {
          await db.buerValidateInsert(
            buyerID,
            product_id,
            1,
            amount,
            package,
            deposit_date,
            "Pending",
            buyerAddress,
            async (err, data) => {
              if (err) {
                console.log(err);
                return res.status(404).send({ error: "Network Error" });
              } else {
                await sendAdminReceipt(
                  "info@onefarmtech.com",
                  name,
                  cartOrderObj,
                  async (errMsg, resMsg) => {
                    if (errMsg) {
                      console.log(errMsg);
                    }
                  }
                );

                await generatePdf(
                  email,
                  name,
                  cartOrderObj,
                  async (errsPP, resPP) => {
                    if (errsPP) {
                      console.log(errsPP);
                    }
                  }
                );
                return res.status(200).send({
                  msg: "Your payment was successful and you will be contacted within 24 hrs",
                });
              }
            }
          );
        }
      } else {
        return res
          .status(404)
          .send({ error: "You tried to pay invalid Amount !" });
      }
    } else {
      db.buerValidateInsert(
        buyerID,
        product_id,
        1,
        0,
        package,
        deposit_date,
        "Failed Transaction",
        async (err, data) => {
          if (err) {
            console.log(err);
            return res.status(404).send({
              error: "You have a slow network connection, please try again ",
            });
          } else {
            return res.status(200).send({
              msg: "We encoutered error with your card but you will be contacted within 24 hrs",
            });
          }
        }
      );
    }
  });
};

exports.mining = async (req, res) => {
  let userDataInput;

  res.render("mining", { error: req.flash("error"), userDataInput });
};

exports.MiningPlans = (req, res) => {
  let img = "";
  let address = "";
  let userDataInput;

  // console.log(req.params.id)

  let miningCoin = req.params.id.split("$")[0];
  let miningPackage = req.params.id.split("$")[1];
  miningCoin == "Packages"
    ? ((address = "bc1qelgnqynwepx8d930u7esktmzj6x79d69wrsd7s"),
      (img = "/images/btc.jpeg"))
    : ((address = "0x38eD20fe105750EBc2a0bb8a9366f9C540857a25"),
      (img = "/images/eth.jpeg"));
  Packages[miningCoin] === undefined
    ? res.redirect("back")
    : Packages[miningCoin][miningPackage] === undefined
    ? res.redirect("back")
    : res.render("payment", {
        data: Packages[miningCoin][miningPackage],
        miningCoin,
        miningPackage,
        error: req.flash("error"),
        userDataInput,
        address,
        img,
      });
};

exports.paymemtamt = (req, res) => {
  let address = "bc1qelgnqynwepx8d930u7esktmzj6x79d69wrsd7s";
  let img = "/images/btc.jpeg";

  let userDataInput;
  let { package, depositAmt } = req.body;
  if (!req.body.package || !req.body.depositAmt) {
    req.flash("error", "Enter valid amount");
    res.redirect("back");
  } else {
    res.render("finalPayment", {
      data: package,
      depositAmt,
      error: req.flash("error"),
      userDataInput,
      address,
      img,
    });
  }
};

exports.MiningReceipts = async (req, res) => {
  let { name, mimetype, mv } = req.files.receipt;
  let { packages, depositAmount } = req.body;
  let { user_id } = req.user;
  let imagePath = "receiptImg/" + name;
  let userDataInput;

  await db.data(user_id, async (err, result) => {
    if (err) {
      console.log(err);
      imageParams.includes(mimetype)
        ? (mv("public/receiptImg/" + name),
          db.userReceipts(
            imagePath,
            "pending",
            packages,
            depositAmount,
            user_id,
            "",
            (err, result) => {
              err
                ? (req.flash("error", "network error"),
                  res.redirect("/runningPlans"))
                : (req.flash(
                    "error",
                    "Your transaction is under review and will be updated within 24 hrs"
                  ),
                  res.redirect("/runningPlans"));
            }
          ))
        : (req.flash(
            "error",
            "kindly select valid payment receipt and try again"
          ),
          console.log("Verifying body", req.body),
          res.redirect("/runningPlans"));
    } else {
      console.log("USER RESULT", result);
      var ref;
      for (var obj of result) {
        ref = parseInt(obj.ref);
      }
      console.log("REF", ref);
      if (isNaN(ref)) {
        imageParams.includes(mimetype)
          ? (mv("public/receiptImg/" + name),
            db.userReceipts(
              imagePath,
              "pending",
              packages,
              depositAmount,
              user_id,
              "",
              (err, result) => {
                err
                  ? (console.log(err),
                    req.flash("error", "network error"),
                    res.redirect("/runningPlans"))
                  : (req.flash(
                      "error",
                      "Your transaction is under review and will be updated within 24 hrs"
                    ),
                    res.redirect("/runningPlans"));
              }
            ))
          : (req.flash(
              "error",
              "kindly select valid payment receipt and try again"
            ),
            console.log(req.body),
            res.redirect("/runningPlans"));
      } else {
        imageParams.includes(mimetype)
          ? (mv("public/receiptImg/" + name),
            db.userReceipts(
              imagePath,
              "pending",
              packages,
              depositAmount,
              user_id,
              ref,
              (err, result) => {
                err
                  ? (console.log(err),
                    req.flash("error", "network error"),
                    res.redirect("/runningPlans"))
                  : (req.flash(
                      "error",
                      "Your transaction is under review and will be updated within 24 hrs"
                    ),
                    res.redirect("/runningPlans"));
              }
            ))
          : (req.flash(
              "error",
              "kindly select valid payment receipt and try again"
            ),
            res.redirect("/runningPlans"));
      }
    }
  });
};

exports.runningPlans = async (req, res) => {
  let userDataInput;
  await db.selectByOne(
    "receipts",
    "user_id",
    req.user.user_id,
    (err, result) => {
      if (err) {
        req.flash("error", "network error");
        res.redirect("back");
      } else {
        let { running, pending } = packagesPlans(result);
        console.log(running);
        res.render("tables", {
          error: req.flash("error"),
          running,
          pending,
          userDataInput,
        });
      }
    }
  );
};

exports.withdrawal = async (req, res) => {
  await db.userPackage(req.user.user_id, (err, result) => {
    if (err) {
      req.flash("error", "network error");
      res.redirect("back");
    } else {
      let { running, runningTotalAmt } = packagesPlans(result);
      let { outPut } = validateWithdrawalRequest(running);

      res.render("withdrawal", { outPut, error: req.flash("error") });
    }
  });
};

exports.withdrawalUpdate = async (req, res) => {
  let { id, userID, roi, deposit } = req.params;
  let parsedROI = parseInt(roi);
  let parsedDeposit = parseInt(deposit);
  let profit = parsedROI - parsedDeposit;
  console.log("PROFIT GOING TO THE DETABLE", profit);

  await sql.query(
    "UPDATE receipts SET roi = ? WHERE id=? AND user_id=?",
    [profit, parseInt(id), parseInt(userID)],
    async (err, result) => {
      if (err) {
        req.flash("error", "network error");
        res.redirect("back");
      } else {
        res.render("finalWithdraw", {
          receiptID: id,
          roi,
          profit,
          error: req.flash("error"),
          success: req.flash("success"),
        });
      }
    }
  );
};

exports.withdrawalRequest = async (req, res) => {
  console.log(req.body);
  let { wallet, roi, receiptID } = req.body;

  await sql.query(
    "SELECT roi, withdraw_req FROM receipts WHERE id=? AND user_id=?",
    [parseInt(receiptID), req.user.user_id],
    async (err, result) => {
      if (err) {
        console.log(err);
        req.flash("error", "network error");
        res.redirect("back");
      } else {
        let roiDB, withdraw_reqDB;
        for (var obj of result) {
          roiDB = parseInt(result[0].roi);
          withdraw_reqDB = parseInt(result[0].withdraw_req);
        }
        let compareRoi = roiDB - withdraw_reqDB;
        console.log("COMPARE TOTAL AMOUNT ", compareRoi);
        if (parseInt(roi) > compareRoi) {
          req.flash(
            "error",
            "Your total withdraw must be less than or equal to your return of investment (ROI)"
          );
          res.redirect("back");
        } else {
          await db.withdrawalRequest(
            wallet,
            req.user.user_id,
            roi,
            parseInt(receiptID),
            (err, result) => {
              if (err) {
                req.flash("error", "network error");
                res.redirect("back");
              } else {
                req.flash(
                  "error",
                  "Your request has been receive, it will be processed within 24hrs"
                );
                res.redirect("/withdrawal");
              }
            }
          );
        }
      }
    }
  );
};

exports.DeletePlan = (req, res) => {
  const { id } = req.params;
  db.deletePlan(id, req.user.user_id, (err, output) => {
    err
      ? (req.flash("error", "network error"), res.redirect("back"))
      : (req.flash("error", "Plan Deleted Successfully"), res.redirect("back"));
  });
};

exports.setting = (req, res) => {
  res.render("setting", {
    error: req.flash("error"),
    success: req.flash("success"),
  });
};

exports.changePassword = async (req, res) => {
  let { user_id } = req.user;
  let { email, password, newPassword } = req.body;

  const encryptedPassword = await bcrypt.hash(newPassword, saltRounds);

  await db.emailPasswordValidate(email, user_id, async (err, result) => {
    if (err)
      return req.flash("error", "Incorrect details"), res.redirect("back");
    else {
      if (result.length > 0) {
        const hash = result[0].password.toString();
        bcrypt.compare(password, hash, async function (err, response) {
          if (response === true) {
            await db.updatePassword(
              encryptedPassword,
              user_id,
              (err, outcome) => {
                err
                  ? (req.flash("error", "Network Error"), res.redirect("back"))
                  : (req.flash("success", "Password changed successfuly"),
                    res.redirect("back"));
              }
            );
          } else {
            return (
              req.flash("error", "Incorrect Password"), res.redirect("back")
            );
          }
        });
      } else return req.flash("error", "Incorrect Email"), res.redirect("back");
    }
  });
};

exports.contactSubmit = async (req, res) => {
  // console.log("____________________________")
  // console.log(req.body)
  await db.contact(req.body, (err, result) => {
    err
      ? (req.flash("error", "Network Error"), res.redirect("back"))
      : (req.flash("error", "Message sent successfuly"), res.redirect("back"));
  });
};

exports.resetPassword = async (req, res) => {
  let otp;
  console.log(req.body);

  await db.forgetPassword(req.body.email, async (err, data) => {
    if (err) {
      req.flash("error", "Email does not exist");
      res.redirect("back");
    } else if (data.length == 0) {
      req.flash("error", "Email does not exist");
      res.redirect("back");
    } else {
      let { email, id } = data;
      otp = Math.round(Math.random() * 100000000);
      db.updateOtp(id, otp, async (err, result) => {
        // console.log("LINE 175 ", result)
        if (err) {
          req.flash("error", "Network Error, try again");
          res.redirect("back");
        } else {
          console.log(otp);
          await sendOtp(email, otp, (err, respoObj) => {
            if (err)
              return (
                req.flash("error", "Network Error, try again"),
                res.redirect("back")
              );
            else
              return res.render("otp", {
                id,
                error: req.flash("error"),
                success: req.flash("success"),
                isAuthenticated: req.isAuthenticated() && req.user.user_id,
              });
          });
        }
      });
    }
  });
};

exports.resetPasswordOtpCode = async (req, res) => {
  let { id, otp } = req.body;
  let parsedID = parseInt(id);
  let parsedOTP = parseInt(otp);
  console.log(req.body, "Ddd");
  db.getOtpVerifications(parsedID, (err, data) => {
    if (err) {
      req.flash("error", "Network Error, Try Again");
      res.render("otp", {
        id,
        error: req.flash("error"),
        success: req.flash("success"),
        isAuthenticated: req.isAuthenticated() && req.user.user_id,
      });
    } else if (data.username == parsedOTP) {
      req.flash("success", "Enter new password");
      res.render("newPassword", {
        id,
        error: req.flash("error"),
        success: req.flash("success"),
        isAuthenticated: req.isAuthenticated() && req.user.user_id,
      });
    } else {
      req.flash("error", "The OTP code you entered is Incorrect");
      res.render("otp", {
        id,
        error: req.flash("error"),
        success: req.flash("success"),
        isAuthenticated: req.isAuthenticated() && req.user.user_id,
      });
    }
  });
};

exports.newPassword = async (req, res) => {
  let hashPassword;
  let { id, password } = req.body;
  console.log(password);
  let parsedID = parseInt(id);

  if (password !== "" || ("" && id)) {
    await bcrypt.hash(password, saltRounds, function (err, hash) {
      hashPassword = hash;
      if (err) {
        req.flash("error", "Network Error");
        res.redirect("back");
      } else {
        db.resetConfirmedPassword(parsedID, hashPassword, (err, data) => {
          if (err) {
            req.flash("error", "Network Error");
            res.redirect("back");
          } else {
            req.flash("success", "Password reset successfully");
            res.redirect("/login");
          }
        });
      }
    });
  } else {
    req.flash("error", "YOUR ENTERED INVALID INPUTS");
    res.render("newPassword", {
      id,
      error: req.flash("error"),
      success: req.flash("success"),
      isAuthenticated: req.isAuthenticated() && req.user.user_id,
    });
  }
};

const RegisterAdmin = async (req, res) => {
  const password = "admin@onefarmtech.com";
  const encryptedPassword = await bcrypt.hash(password, saltRounds);

  let userInfo = {
    email: "admin@onefarmtech.com",
    first_name: "Main",
    last_name: "Admin",
    password: encryptedPassword,
    // repeat_password: encryptedPassword,
  };
  await db.createAdmin(userInfo, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Admin created");
    }
  });
};

// RegisterAdmin()
