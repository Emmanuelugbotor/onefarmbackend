const sql = require("./db.config");
const bcrypt = require("bcryptjs");
const saltRounds = 10;


exports.buerValidateInsert =  (buyer_id, product_id, quantity, amount, package, deposit_date, status, buyerAddress, result) => {
  sql.query(`INSERT INTO paid_farmers(buyer_id, product_id, quantity, amount, package, deposit_date, status, others) VALUES(?,?,?,?,?,?,?,?)`,
   [buyer_id, product_id, quantity, amount, package, deposit_date, status, buyerAddress], function (err, res) {
    if (err) {
      console.log("error", err);
      result(null, err);
    } else { result(null, res) }

  });
}

exports.selectByOne = (databaseTable, column, selectValue, result) => {
  sql.query(`SELECT * FROM ${databaseTable} WHERE ${column} = ?`, [selectValue], (err, output) => {
    if (err) return result(err, null);
    return result(null, output);
  });
};

exports.usersDashboard = async (id, result) => {
      sql.query(`SELECT *, product.category FROM paid_farmers INNER JOIN product ON(paid_farmers.product_id=product.id) WHERE paid_farmers.buyer_id=${id} ORDER BY paid_farmers.id DESC`, (error, respon)=>{
        if(error){
          console.log(error)
          result(null, error)
        }else{
          result(null, respon)
        }
      })
}

exports.validateViaEmail = async (userEmail, result) => {
  // console.log(userEmail)
  sql.query(`SELECT id, email FROM farmers WHERE email = ?`, [userEmail], (err, res) => {
   
    if (Object.entries(res).length === 0) {
      result(null, { email: "nullnull" })
      return;
    }
    if (err) {
      result(err, null);
    }
    else { result(null, { email: res[0].email }) }
  });
};






























































exports.selectAll = (databaseTable, result) => {
  sql.query(`SELECT * FROM ${databaseTable}`, (err, output) => {
    if (err) return result(err, null);
    return result(null, output);
  });
};

exports.data = async (id, result) => {
  await sql.query(`SELECT fullname, phone, ref, email FROM miningusers WHERE id=?`, [id], async (err, output) => {
    if (err) return (err, null)
    return result(null, output)
  })
};

exports.forgetPassword = async (userID, result) => {
  await sql.query(`SELECT id, email FROM miningusers WHERE email = ?`, [userID], (err, resp) => {
    if (err){
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (resp.length) {
      console.log("found customer: ", resp[0]);
      result(null, resp[0]);
      return;
    }
      result({ kind: "not_found" }, null);
    
    // not found Customer with the id `
  });
};

exports.updateOtp = async (id, otp, result) => {
  await sql.query(
    "UPDATE miningusers SET username = ? WHERE id = ?",
    [otp, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      return result(null, res);
    }
  );
};

exports.getOtpVerifications = (userID, result) => {

  sql.query(`SELECT id, email, username FROM miningusers WHERE id = ${userID}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found customer: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Customer with the id
    result(null, []);
  });

};

exports.resetConfirmedPassword = (id, password, result) => {
  
  sql.query(
    "UPDATE miningusers SET password = ? WHERE id = ?",
    [password, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Customer with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated verified: ", { res });
      result(null, { id: id });
    }
  );
};


exports.userPackage = async (userID, result) => {
  await sql.query(
    `SELECT * FROM receipts WHERE user_id=?`,
    [userID],
    async (err, output) => {
      if (err) return result(err, null);
      else{
        await sql.query(`SELECT ref FROM miningusers WHERE ref=${userID} `, async(errs, numOfRef)=>{
          if (errs) return result(errs, output, null);
          else{
            // let ref;
            // for (var obj of resut) {
            //   ref = parseInt(obj.ref)
            //   // console.log("REF", ref)
            // }

            // if (isNaN(ref)) {
              
            //   return result(null, output);
            //   }
            
            //   else{
                await sql.query(
                  // `SELECT *, miningusers.fullname, miningusers.phone FROM receipts INNER JOIN miningusers ON(receipts.user_id = miningusers.id) WHERE receipts.user_id=?`,
                  `SELECT * FROM receipts WHERE reference=?`,
                  [userID],
                  async (err, refData) => {
                    if (err) {
                      // console.log(err);
                      return result(err, output, numOfRef, null)
                    }
                    else{
                      return result(err, output, refData, numOfRef);
                    }

                  })
              // }
          }
          
        })
      }
    }
  );
};
// exports.validateFields = (tablename, column, data, result) => {
//   sql.query(`SELECT * FROM ${tablename} WHERE ${column} = ?`, [data], (err, output) => {
//     if (err) return result(err, null);
//     return result(null, output);
//   });
// };

exports.emailPasswordValidate = (email, userId, result) => {
  sql.query(`SELECT * FROM miningusers WHERE email = ? AND id=?`, [email, userId], (err, output) => {
    if (err) return result(err, null);
    return result(null, output);
  });
};

exports.adminEmailValidate = (email, userId, result) => {
  sql.query(`SELECT * FROM miningadmin WHERE email = ? AND id=?`, [email, userId], (err, output) => {
    if (err) return result(err, null);
    return result(null, output);
  });
};

exports.insertUsers = (tablename, userObj, result) => {
  sql.query(`INSERT INTO ${tablename} SET ?`, [userObj], (err, output) => {
    if (err) return result(err, null);
    return result(null, output);
  });
};


exports.userReceipts = (receiptImg, status, package, amount, user_id, reference, result) => {
  sql.query(
    `INSERT INTO receipts(receiptImg, status, package, amount, user_id, reference) VALUES(?,?,?,?,?,?)`,
    [receiptImg, status, package, amount, user_id, reference],
    async (err, output) => {
      if (err) {
        console.log(err);
        return result(err, null)
      }
      return result(null, output);
    }
  );
};


exports.withdrawalRequest = (wallet, user_id, roi, receiptID, result) => {
  sql.query(
    `INSERT INTO withdrawal(wallet, user_id, roi, receiptID) VALUES(?,?,?,?)`,
    [wallet, user_id, roi, receiptID],
    async (err, output) => {
      if (err) return result(err, null);
      return result(null, output);
    }
  );
};



exports.checkAdmin = (adminObj, result) => {

  sql.query( 
    `SELECT * FROM admin WHERE email = ?`,
    [adminObj.email],
    async (err, output) => {
      if (err) return consoel.log(err), result(err, null);
      return result(null, output);
    }
  );

};


exports.getUserInfo = async (result) => {

  sql.query("SELECT * FROM farmers ORDER BY id DESC", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    }
    else {
      result(null, res) 
    }
  });
  
};

exports.adminDeleteUserWithID =(id, table, result) => {
  sql.query(`DELETE FROM ${table} WHERE id = ?`,[id], (err, res) => {
    if (err) {
      console.log("error", err)
      result(null, err)
    }
    else { result(null, res) }
  })
}


exports.deliveryStatus = (id, customer,  result) => {
  sql.query(
    "UPDATE paid_farmers SET status = ? WHERE id = ?",
    [customer, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        // not found Customer with the id
        result({ kind: "not_found" }, null);
        return;
      }
      // console.log("updated customer: ", { id: id, ...customer });
      result(null, { id: id, ...customer });
    }
  );
};



exports.updateById = (id, fullbag, halfbag, quarterbag, desc, result) => {
  sql.query("UPDATE product SET fullbag = ?, halfbag = ?, quaterbag = ?, desc = ? WHERE id = ?",
    [fullbag, halfbag, quarterbag, desc, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Customer with the id
        result({ kind: "not_found" }, null);
        return;
      }

      // console.log("updated customer: ", { id: id, ...customer });
      result(null, { id: id });
    }
  );
};















































exports.planStatusUpdate = async (
  userID,
  receiptID,
  depositedate,
  duedate,
  result
) => {
  sql.query(
    `UPDATE receipts SET status=?, depositdate=?, duedate=? WHERE user_id=? AND id=?`,
    ["Active", depositedate, duedate, userID, receiptID],
    (err, output) => {
      if (err) return console.log(err), result(err, null);
      return result(null, output);
    }
  );
};


exports.updatePassword = async (password, userID, result) => {
  sql.query(
    `UPDATE miningusers SET password=? WHERE id=?`,
    [ password, userID],
    (err, output) => {
      if (err) return console.log(err), result(err, null);
      return result(null, output);
    }
  );
};

exports.updateAdminPassword = async (password, userID, result) => {
  sql.query(
    `UPDATE miningadmin SET password=? WHERE id=?`,
    [ password, userID],
    (err, output) => {
      if (err) return console.log(err), result(err, null);
      return result(null, output);
    }
  );
};




exports.deleteUser = async(userID, result) => {
  sql.query(`DELETE FROM miningusers WHERE id = ?`, [userID], (err, output) => {
    if (err) return result(err, null)
    return result(null,output)
  })
}

exports.removemsg = async(userID, result) => {
  sql.query(`DELETE FROM contact WHERE id = ?`, [userID], (err, output) => {
    if (err) return result(err, null)
    return result(null,output)
  })
}

exports.deletePlan = async(plandID, userID, result) => {
  sql.query(`DELETE FROM receipts WHERE id = ? AND user_id=?`, [plandID, userID], (err, output) => {
    if (err) return result(err, null)
    return result(null,output)
  })
}

exports.deleteApprovedWithdrawal = async(plandID, userID, result) => {
  sql.query(`DELETE FROM withdrawal WHERE id = ? AND user_id=?`, [plandID, userID], (err, output) => {
    if (err) return result(err, null)
    return result(null,output);
  })
}

exports.approvedWithdrawal = async(plandID, userID, result) => {

  sql.query(`SELECT * FROM receipts WHERE id = ? AND user_id=?`, [plandID, userID], (err, output) => {
    if (err) return result(err, null)
    return result(null,output)
  })

}

exports.contact = (userObj, result) => {
  sql.query(`INSERT INTO contact SET ?`, [userObj], (err, output) => {
    if (err) return result(err, null);
    return result(null, output);
  });
};


exports.createAdmin = async(adminData, result) => {
  sql.query(`INSERT INTO admin SET ?`, [adminData], (err, output) => {
    if (err) return result(err, null)
    return result(null,output)
  })
}















const insertAdmin = async (result) => {
  const adminPassword = "iAmAdmin";
  const adminEmail = "admin@blockchain.com";

  const encryptedAdminPass = await bcrypt.hash(adminPassword, saltRounds);
  adminObj = {
    email: adminEmail,
    password: encryptedAdminPass,
  }; 

  sql.query(`INSERT INTO miningadmin SET ?`, [adminObj], async (err, output) => {
    if (err) {
      return result(err, null);
    } else {
      return result(null, output);
    }
  });
};



// insertAdmin((err, result)=>{
//   if(err) console.log(err)
// })
