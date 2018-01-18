"use strict";
var Proxy_1 = require("./Proxy");
process.on("uncaughtException", function (error) {
    /* prevent unhandled process errors from stopping the proxy */
    console.error("process error:", error.message);
});
module.exports = Proxy_1.default;
