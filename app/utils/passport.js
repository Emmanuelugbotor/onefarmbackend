const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db =  require("../models/models")


    passport.use('login', new LocalStrategy(
      async function (username, password, done) {
        let userInfo = {
            email: username,
            password: password
          }
        await db.selectByOne("miningusers", "email", userInfo.email, async(err, result) => {
            if (err) { done(err) }
            else {
              if (result.length > 0) {
                const hash = result[0].password.toString();
                bcrypt.compare(userInfo.password, hash, function (err, response) {
                    
                    if (response === true) {
                        return done(null, { user_id: result[0].id }, { message: "Successful login" })
                    }
                    else { return done(null, false, { message: "Incorrect email or password" }) }
                })
              }
              else {
                 return done(null, false, { message: "Incorrect email or password" }) 

              }
            }
          })
  
      }
  ))
  passport.serializeUser(function (user_id, done) {
      done(null, user_id)
  });
  passport.deserializeUser(function (user_id, done) {
      done(null, user_id)
  });



  passport.use( "admin", new LocalStrategy(async function (username, password, done) {
      let adminObj = {
        email: username,
        password: password,
      };
      console.log(adminObj)
      await db.checkAdmin(adminObj, async (err, result) => {
        if (err) {
          done(err);
        } else {
          if (result.length > 0) {
            const hash = result[0].password.toString();
            bcrypt.compare(adminObj.password, hash, (err, response) => {
              if (response === true) {
               
                return done(
                  null,
                  { admin_id: result[0].id },
                  { message: "Successful login" }
                  );
                } else {
                  return done(null, false, { message: "Incorrect Password" });
              }
            });
          } else {
            return done(null, false, { message: "Incorrect email " });
          }
        }
      });
    })
    );
    passport.serializeUser(function (admin_id, done) {
      done(null, admin_id);
  });
  passport.deserializeUser(function (admin_id, done) {
    done(null, admin_id);
  });
