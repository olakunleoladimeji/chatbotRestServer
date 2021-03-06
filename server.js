"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const mailer = require("nodemailer");
const request = require("request");
const maps = require("@google/maps").createClient({
    key: "AIzaSyCttV-cq6VmgCXaA3l43zT7zrixbvufr7w"
});
const ipinfodbKey = "4fc168f6017c0fc8fdee2142673d69aaa625260bec6bab276039588048ed0d0c";
let transporter = mailer.createTransport({
    service: "gmail",
    auth: {
        user: "kunleoladimeji@gmail.com",
        pass: "obawalee"
    }
});

const restService = express();
restService.use(bodyParser.urlencoded({
    extended: true
}));
restService.use(bodyParser.json());
restService.use("/", express.static(__dirname + "/public"));
restService.post('/mcb', function (req, res) {
    var action = req.body.result ? req.body.result.action : "There was a problem getting the action";
    var speech = "There was a problem with this request";
    console.log("Action is " + action);
    switch (action) {
        case "calculator.questions":
            var loan_type = req.body.result.parameters.loan_type;
            var principal = parseFloat(req.body.result.parameters.monthly_payment);
            var interest_rate = parseFloat(req.body.result.parameters.interest_rate);
            var payments = parseFloat(req.body.result.parameters.pay_back_over);
            if (principal == "NaN" || interest_rate == "NaN" || payments == "NaN") {

            } else {
                var x = Math.pow(1 + interest_rate, payments); //Math.pow computes powers
                var monthly = (principal * x * interest_rate) / (x - 1);
                if (isFinite(monthly)) {
                    var total_payment = (monthly * payments).toFixed(2);
                    var total_interest = ((monthly * payments) - principal).toFixed(2);
                    var monthly_payment = monthly.toFixed(2);
                    var entitled_to_amount = 1000;
                    var speech = "Based on my calculations, you will be able to get a Rs." + entitled_to_amount + ", with an interest of Rs." + total_interest + " over a period of " + payments + "years";
                } else {
                    speech = "There was a problem with this request";
                }
            }

            break;
        case "loanapplication.questions":
            var name = req.body.result.parameters.user_name || "Sample User";
            var loanType = req.body.result.parameters.loan_type;
            var maritalStatus = req.body.result.parameters.marital_status;
            var income = req.body.result.parameters.income_amount;
            var collateral = req.body.result.parameters.collateral;
            var contact_num = req.body.result.parameters.contact_num;
            let mailOptions = {
                from: '"Loan Application ChatBox" <chat@mcb.com>',
                to: "kunleoladimeji@gmail.com",
                subject: "New Loan Application",
                text: "There was an enquiry by " + name + " at " + Date() + "<br />" + "<h1>User Details</h1>" + "Income: " + income + "<br /> Loan Type: " + loanType + "<br /> Collateral: " + collateral + " Contact Number: " + contact_num
            }
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    speech = "There was an error sending the email!";
                    return console.log("Error!");
                }
                speech = "Email sent! A representative will be in touch shortly!";
                console.log("Message %s sent: %s", info.messageId, info.response);
            });
            break;
        case 'nearestmcb.questions':
            var location = req.body.result.parameters.location;
            var user_ip = req.ip.replace("::ffff:", "");
            request.get("http://api.ipinfodb.com/v3/ip-city/?key=" + ipinfodbKey + "&ip=" + user_ip + "&format=json", (error, response, body) => {
                console.log(body);
            });
            speech = "Sorry, we could not process your location, please try later!";
            // if (user_LatLng.ll) {
            //     maps.directions({
            //             origin: user_LatLng.ll,
            //             destination: "nearest mcb"
            //         }, (error, response) => {
            //             if (error) {
            //                 return console.log(error);
            //             }
            //             speech = "Calculating your location shortly!";
            //             console.log(response);
            //         }

            //     )
            // } else {
            //     speech = "Sorry, I could not determine your location!";
            // }

            break;
        default:
            var speech = "There was a problem with this request";
            var displayText = "There was a problem with this request";
            break;
    }
    return res.json({
        speech: speech,
        displayText: speech,
        source: "mcb-chat-webhook"
    });
});
restService.listen((process.env.PORT || 3001), function () {
    console.log("Server up and running!");
})
