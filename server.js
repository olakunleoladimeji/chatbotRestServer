"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const restService = express();
restService.use(bodyParser.urlencoded({
    extended: true
}));
restService.use(bodyParser.json());
restService.get("/", function (req, res) {
    return res.send("Hello World!");
})
restService.post('/mcb', function (req, res) {
    var action = req.body.result.action ? req.body.result.action : "There was a problem getting the action";
    switch (action) {
        case "calculator.questions":
            var loan_type = req.body.result.parameters.loan_type;
            var principal = parseFloat(req.body.result.parameters.monthly_payment);
            var interest_rate = parseFloat(req.body.result.parameters.interest_rate);
            var payments = parseFloat(req.body.result.parameters.pay_back_over);
            if (principal == "NaN" || interest_rate == "NaN" || payments == "NaN") {
                var speech = "There was a problem with this request";
                var displayText = "There was a problem with this request";

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
                    var speech = "There was a problem with this request";
                }
            }

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
