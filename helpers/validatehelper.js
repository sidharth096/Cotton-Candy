const twilioFunctions = require('../config/twilio')
const user = require("../models/usermodel")
const bcrypt = require('bcrypt')
const mongoose = require("mongoose");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken)


module.exports={

  

checkotpSignup: function (phonenumber) {
    console.log("5");
    return new Promise((resolve, reject) => {
      try {
        console.log("6");
        twilioFunctions.generateOTP(phonenumber);
        let msg = "OTP sent";
        resolve({ status: true, msg });
      } catch (error) {
        reject(error);
      }
    });
  },
  

verifyOTPSignup: async (req, res) => {
    console.log("9");
    console.log(req.body);
    const otp =
      req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4 + req.body.otp5;
    console.log("10");
    const phonenumber = req.body.phone;
    console.log(phonenumber);
    console.log(req.session.signupdata);
    let body =req.session.signupdata
  
    try {
      const verificationChecks = await client.verify
        .services('VA8b01b7f5e6f1671b4ddf2e23e407544e')
        .verificationChecks.create({
          to: `+91${phonenumber}`,
          code: otp
        });
        console.log("11");
  
      if (verificationChecks.status === 'approved') {
        console.log(req.session.signupdata);
        const saltRounds = 10;
        const password = body.password;
        console.log("12");
        try {
          if (!password) {
            throw new Error('No password provided');
          }
          console.log("13");
          console.log(body);
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          console.log(hashedPassword);
          const newUser = new user({
            name: body.name,
            email: body.email,
            password: hashedPassword,
            phonenumber:   body.mobile,
            status: false
          });
  
          const savedUser = await newUser.save();
          req.session.user = true;
          req.session.userid = savedUser;
          res.redirect('/home');
        } catch (error) {
          console.error(error);
          res.render('catchError', { message: error.message });
        }
      } else {
        let msg = 'Incorrect OTP';
        res.render('shop/verifyotpsignup.ejs', { msg, phonenumber });
      }
    } catch (error) {
      console.error(error);
      res.render('catchError', { message: error.message });
    }
  }
  
  
}