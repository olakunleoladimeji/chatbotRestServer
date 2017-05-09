"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const restService = express();
restService.use(bodyParser.urlencoded({
    extended: true
}));
restService.use(bodyParser.json());
restService.post('/calculator', function (req, res) {
    var speech = req.body.result ? req.body.result : "There was a problem with this request";
    return res.json({
        speech: speech,
        displayText: speech,
        source: "mcb-chat-webhook"
    });
});
restService.listen((process.env.PORT || 3001), function () {
    console.log("Server up and running!");
})