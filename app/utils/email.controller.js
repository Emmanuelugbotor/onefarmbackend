// const nodemailer = require("nodemailer");
const sql = require("../models/models");
let count = Math.round(Math.random() * 100000)
let nodemailer = require("nodemailer")




// FOR SENDING RECEIPTS TO CLIENTS ON SUCESSFUL PAYMENT
exports.generatePdf = async (email, name, cartOrderObj, result) => {
  var CartMsg = ('')
  
  cartOrderObj.forEach((element)=>{
    CartMsg +=
    `<tr>`+
     `<th scope="row"  style="border-width: medium; border-style: outset;height: 30px; ">` + `Product Name` + `</th>` +
     `<th style="border-width: medium; border-style: outset; height: 30px;">` + element.name + `</th>` +
     `</tr>`+

     `<tr>` +
     `<th scope="row"  style="border-width: medium; border-style: outset;height: 30px; ">` + `Amount` + `</th>` +
     `<th style="border-width: medium; border-style: outset; height: 30px;">` + element.sellingPrice + `</th>` +
     `</tr>` +
     
     `<tr>` +
     `<th scope="row"  style="border-width: medium; border-style: outset;height: 30px; ">` + `Type` + `</th>` +
     `<th style="border-width: medium; border-style: outset; height: 30px;">` + (element.sellingPrice == parseInt(element.fullbag) ? 'Full Bag' :
      element.sellingPrice == parseInt(element.halfbag) ? 'Half Bag' : "Quarter Bag") + `</th>` +
      `</tr>`
   
 })

      var today = new Date();
      var date = today.getDate() + "/" +   (today.getMonth() + 1) + "/" + today.getFullYear()  

                let message = (
                   `<center>`+
                   `<div style="background-image: linear-gradient(to right, rgba(255, 251, 251, 0.73), rgba(255, 251, 251, 0.73)), url(https://onefarmtech.com/images/logo.png) height="100" style="height:100px" width:100px"; background-size: contain; background-repeat: no-repeat; background-position-x: center;">` + 
   `<img src="https://onefarmtech.com/images/logo.png" height="100" style="height:100px; width:100px;" />` +

    `<h3> Successful Purchase </h3>` +

    `<table width="100%" border="0" cellspacing="5" cellpadding="10"  style="background-image: linear-gradient(to right, rgba(255, 251, 251, 0.73), rgba(255, 251, 251, 0.73)), url(https://onefarmtech.com/images/logo.png); background-size: contain; background-repeat: no-repeat; background-position-x: center;">` +
      `<tbody style="text-align: left;">` +
        `<tr>` +
          `<th scope="row"  style="border-width: medium; border-style: outset;height: 30px; ">` + `Date` + `</th>` +
          `<th style="border-width: medium; border-style: outset; height: 30px;">` + date + `</th>` +
        `</tr>` +
        
        `<tr>` +
          `<th scope="row"  style="border-width: medium; border-style: outset;height: 30px; ">` + `Account Name` + `</th>` +
          `<th style="border-width: medium; border-style: outset; height: 30px;">` + name + `</th>` +
        `</tr>` +
       
        `<tr>` +
          `<th scope="row"  style="border-width: medium; border-style: outset;height: 30px; ">` + `Account Email` + `</th>` +
          `<th style="border-width: medium; border-style: outset; height: 30px; color:black">` + email + `</th>` +
        `</tr>` +
        
           CartMsg +
 
        `<tr>` +
          `<th style="border-width: medium; border-style: outset;height: 30px" scope="row">` + `Payment Type` + `</th>` +
          `<th style="border-width: medium; border-style: outset;height: 30px">` + `Atm Card` + `</th>` +
        `</tr>` +
        

        `<tr>` +
          `<th style="border-width: medium; border-style: outset;height: 30px; " scope="row">` + `Payment Status` + `</th>` +
          `<th style="border-width: medium; border-style: outset;height: 30px; ">` + `Approved` +`</th>` +
        `</tr>` +

    `</tbody>` +
`</table>` +
`<p style="padding: 20px;">` + `<b>` +  `Your payment was successful, the products will be delivered to you,  and also get 10% referral commission when you refer your friends and colleagues.` + `</b>` +  `</p>` +
 ` </div>` + 
` </center>`

  )

                var mailOption = {

                    from: `ONEFARM TECH info@onefarmtech.com`,
                    to: `${email}`,
                    subject: `PAYMENT RECEIPT`,
                    html: message,
                    // attachments: [
                    //     {
                    //         filename: `invoice${id}.pdf`,
                    //         contentType: `application/pdf`,
                    //         encoding: `base64`,
                    //         content: fs.createReadStream(pathToFile),
                    //         path: `${pathToFile}`,

                    //     }
                    // ]
                }
                var transporter = nodemailer.createTransport({
                  
                    host: `onefarmtech.com`,
                    port: 465,
                    secure: true,
                    auth: {
                        user: `info@onefarmtech.com`,
                        pass: `info@onefarmtech.com`
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });
                transporter.sendMail(mailOption, (error, info) => {
                    if (error){
                        console.log("Error occured while sending withdrawal email")
                        console.log(error)
                        return result(error, null)
                    }
                    else {
                        console.log("Sending receiptssssss. SENT")
                        return result(null, info)

                    } 
                });      
}  

exports.sendAdminReceipt = async (email, name, cartOrderObj, result) => {
  var CartMsg = ('')
  
  cartOrderObj.forEach((element)=>{
    CartMsg +=
    `<tr>`+
     `<th scope="row"  style="border-width: medium; border-style: outset;height: 30px; ">` + `Product Name` + `</th>` +
     `<th style="border-width: medium; border-style: outset; height: 30px;">` + element.name + `</th>` +
     `</tr>`+

     `<tr>` +
     `<th scope="row"  style="border-width: medium; border-style: outset;height: 30px; ">` + `Amount` + `</th>` +
     `<th style="border-width: medium; border-style: outset; height: 30px;">` + element.sellingPrice + `</th>` +
     `</tr>` +
     
     `<tr>` +
     `<th scope="row"  style="border-width: medium; border-style: outset;height: 30px; ">` + `Type` + `</th>` +
     `<th style="border-width: medium; border-style: outset; height: 30px;">` + (element.sellingPrice == parseInt(element.fullbag) ? 'Full Bag' :
      element.sellingPrice == parseInt(element.halfbag) ? 'Half Bag' : "Quarter Bag") + `</th>` +
      `</tr>`
   
 })

      var today = new Date();
      var date = today.getDate() + "/" +   (today.getMonth() + 1) + "/" + today.getFullYear()  

                let message = (
                   `<center>`+
                   `<div style="background-image: linear-gradient(to right, rgba(255, 251, 251, 0.73), rgba(255, 251, 251, 0.73)), url(https://onefarmtech.com/images/logo.png) height="100" style="height:100px" width:100px"; background-size: contain; background-repeat: no-repeat; background-position-x: center;">` + 
   `<img src="https://onefarmtech.com/images/logo.png" height="100" style="height:100px; width:100px;" />` +

    `<h3> Successful Purchase </h3>` +

    `<table width="100%" border="0" cellspacing="5" cellpadding="10"  style="background-image: linear-gradient(to right, rgba(255, 251, 251, 0.73), rgba(255, 251, 251, 0.73)), url(https://onefarmtech.com/images/logo.png); background-size: contain; background-repeat: no-repeat; background-position-x: center;">` +
      `<tbody style="text-align: left;">` +
        `<tr>` +
          `<th scope="row"  style="border-width: medium; border-style: outset;height: 30px; ">` + `Date` + `</th>` +
          `<th style="border-width: medium; border-style: outset; height: 30px;">` + date + `</th>` +
        `</tr>` +
        
        `<tr>` +
          `<th scope="row"  style="border-width: medium; border-style: outset;height: 30px; ">` + `Account Name` + `</th>` +
          `<th style="border-width: medium; border-style: outset; height: 30px;">` + name + `</th>` +
        `</tr>` +
       
        `<tr>` +
          `<th scope="row"  style="border-width: medium; border-style: outset;height: 30px; ">` + `Account Email` + `</th>` +
          `<th style="border-width: medium; border-style: outset; height: 30px; color:black">` + email + `</th>` +
        `</tr>` +
        
           CartMsg +
 
        `<tr>` +
          `<th style="border-width: medium; border-style: outset;height: 30px" scope="row">` + `Payment Type` + `</th>` +
          `<th style="border-width: medium; border-style: outset;height: 30px">` + `Atm Card` + `</th>` +
        `</tr>` +
        

        `<tr>` +
          `<th style="border-width: medium; border-style: outset;height: 30px; " scope="row">` + `Payment Status` + `</th>` +
          `<th style="border-width: medium; border-style: outset;height: 30px; ">` + `Approved` +`</th>` +
        `</tr>` +

    `</tbody>` +
`</table>` +
`<p style="padding: 20px;">` + `<b>` +  `Your payment was successful, the products will be delivered to you,  and also get 10% referral commission when you refer your friends and colleagues.` + `</b>` +  `</p>` +
 ` </div>` + 
` </center>`

  )

                var mailOption = {

                    from: `ONEFARM TECH info@onefarmtech.com`,
                    to: `${email}`,
                    subject: `PAYMENT RECEIPT`,
                    html: message,
                    // attachments: [
                    //     {
                    //         filename: `invoice${id}.pdf`,
                    //         contentType: `application/pdf`,
                    //         encoding: `base64`,
                    //         content: fs.createReadStream(pathToFile),
                    //         path: `${pathToFile}`,

                    //     }
                    // ]
                }
                var transporter = nodemailer.createTransport({
                  
                    host: `onefarmtech.com`,
                    port: 465,
                    secure: true,
                    auth: {
                        user: `info@onefarmtech.com`,
                        pass: `info@onefarmtech.com`
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });
                transporter.sendMail(mailOption, (error, info) => {
                    if (error){
                        console.log("Error occured while sending withdrawal email")
                        console.log(error)
                        return result(error, null)
                    }
                    else {
                        console.log("Sending receiptssssss. SENT")
                        return result(null, info)

                    } 
                });      
}  


exports.sendOtp = async (email, otp, result) => {
                
                let message = (
                   `<center>`+
                   `<img src="https://onefarmtech.com/images/logo.png" height="100px" style="margin-bottom: -35px; height:100px; width:100px;" />`+
                 
                   `<div style="border-top-color: #26a69a; width: 100%; margin: 20; padding: 10; border-width: thick; border-style: outset;">`+
                     
                     `<h1 style="font-family:Arial, Helvetica, sans-serif ;">` +' Verification needed' + `</h1>`+
                     `<div style="text-align: left; padding: 20px;">` +
                       `<p>` +  `<b>`+ 'Please confirm your reset password code request' + `</b>`+ `</p>`+
                   
                      ` <p>` + 'We have detected an account reset request from a device about your onefarm tech account.' + ` </p>` +
                 
                       `<p>` + 'To verify your account is safe, please use the following code to enable you reset your password:' + `</p>` +
                 
                     `</div>`+
                 
                     `<div style="background-color: #f2f2f2; height: 40px; text-align: center;">` +
                       `<p style="padding: 10px;">` +  otp +  `</p>`+
                 
                     `</div>`+
                 
                     `<div style="text-align: left; padding: 20px;">` +
                 
                       `<h3>` + 'That wasn\'t me ?' +  `</h3>`+ 
                 
                 'If the above sign-in attempt wasn\'t you, please quickly login to your onefarm tech account and change your password.'+
                     `</div>`+
                   `</div>` +
                  `</center>` 

  )
 

  // console.log("SENDING EMAIL TO ", email)
                var mailOption = {
                    from: `ONEFARM TECH info@onefarmtech.com`,
                    to: `${email}`,
                    subject: `RESET OTP CODE`,
                    html: message,

                    // attachments: [
                    //     {
                    //         filename: `invoice${id}.pdf`,
                    //         contentType: `application/pdf`,
                    //         encoding: `base64`,
                    //         content: fs.createReadStream(pathToFile),
                    //         path: `${pathToFile}`,
                    //     }
                    // ]

                }

                var transporter = nodemailer.createTransport({
                  
                  host: `onefarmtech.com`,
                  port: 465,
                  secure: true,
                  auth: {
                      user: `info@onefarmtech.com`,
                      pass: `info@onefarmtech.com`
                  },
                  tls: {
                      rejectUnauthorized: false
                  }
              });


                transporter.sendMail(mailOption, (error, info) => {
                    if (!error){
                      // console.log(error)
                      console.log("otp code  receiptssssss. SENT")
                      return result(null, info)
                    } 
                    else {
                      console.log("Error occured while sending otp code")
                      return result(error, null)


                    } 
                })
            

        
}   

 