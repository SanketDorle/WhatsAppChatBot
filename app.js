var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();
const twilio = require('twilio')

const accountSid = 'ACd222750bf6b38d8cd0fd0fa7f27e0d85';
const authToken = '******ed8e4f73f02955b91dde******';
const client = new twilio(accountSid, authToken);

app.use(bodyParser.urlencoded({ 'extended': 'false' }));

// https://3f747ab3.ngrok.io

let UserSchema = new mongoose.Schema({
    // UserId : mongoose.Schema.Types.ObjectId,
    userName : String,
    mobileNumber : String,
    gasCardId : String,
    gasRefillHistory :  [{ type: mongoose.Schema.Types.ObjectId, ref: 'GasRefill'}],
    prvQuestion : String
})

let gasRefillSchema = new mongoose.Schema({
    // UserId : mongoose.Schema.Types.ObjectId,
    created_Date : Number,
    delivered_Date : Number
})

let UserComplaintSchema = new mongoose.Schema({
    complaintId : mongoose.Schema.Types.ObjectId,
    userName : String,
    mobileNumber : String,
    comment : String,
    date : Number
})

var User = mongoose.model('User', UserSchema);
var GasRefill = mongoose.model('GasRefill', gasRefillSchema);
var UserComplaint = mongoose.model('UserComplaint', UserComplaintSchema);

mongoose.connect('mongodb://localhost/WhatsappChatBot').then(()=>{
    console.log("DB Connected");    
});

app.post("/receive-message",(req,res)=>{
    console.log(req.body);
    let phoneNumber = req.body.From.split(":")[1];
    User.find({mobileNumber : phoneNumber},(err,data)=>{
        if(data.length){
            var userData = data[0];
            if(req.body.Body == "hi" || req.body.Body == "Hi" || req.body.Body == "HI" || req.body.Body == "*hi*" || req.body.Body == "*Hi*" || req.body.Body == "*HI*"){
                client.messages.create({
                    from: 'whatsapp:+14155238886',
                    body: `Hello ${userData.userName},\nWelcome to WhatsApp Gas Booking Service!\nWhat you would like to do?\n    *1.* Book a refill\n    *2.* Register a Complaint\n    *3.* Know Booking Status\n    *4.* Change Mobile Number\nPress any of the above numbers.`,
                    to: req.body.From
                  })
                 .then(message => {
                    userData["prvQuestion"] = `Hello ${userData.userName},\nWelcome to WhatsApp Gas Booking Service!\nWhat you would like to do?\n    *1.* Book a refill\n    *2.* Register a Complaint\n    *3.* Know Booking Status\n    *4.* Change Mobile Number\nPress any of the above numbers.`;
                    userData.save(function(err,succ){
                        console.log(err)
                        console.log(succ)
                    })
                 }); 
            }else{
                client.messages.create({
                    from: 'whatsapp:+14155238886',
                    body: `Please text *hi* to start chat.`,
                    to: req.body.From
                  })
                 .then(message => console.log(message.sid)); 
            }
            
        }else{
            client.messages.create({
                from: 'whatsapp:+14155238886',
                body: `Your mobile number ${phoneNumber} is not registered. Please visit your nearest gas station`,
                to: req.body.From
              })
             .then(message => console.log(message.sid));
        }
    })
})

app.get('/',(req,res)=>{
    res.end();
})

app.listen(3000,()=>{
    console.log("Server connected");
})