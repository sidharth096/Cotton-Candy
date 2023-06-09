const dotenv=require('dotenv');
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);




const twilioFunctions = {
  
    generateOTP: async (phonenumber) => {

      client,
      console.log("sdsdfsfd");
      console.log(phonenumber);
      client.verify.v2
        .services('VA8b01b7f5e6f1671b4ddf2e23e407544e')
        .verifications.create({ to: `+91${phonenumber}`, channel: "sms" }).then(service => console.log(service.sid));;
        console.log("sdsdfsfd"); 
    },
  };                             
  
  module.exports= twilioFunctions;