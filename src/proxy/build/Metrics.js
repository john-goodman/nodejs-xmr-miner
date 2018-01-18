"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pmx = require("pmx");
var probe = pmx.probe();
exports.minersCounter = probe.counter({
    name: "Miners"
});
exports.connectionsCounter = probe.counter({
    name: "Connections"
});
exports.sharesCounter = probe.counter({
    name: "Shares"
});
exports.sharesMeter = probe.meter({
    name: "Shares per minute",
    samples: 60
});
