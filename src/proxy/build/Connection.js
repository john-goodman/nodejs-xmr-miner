"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter = require("events");
var net = require("net");
var tls = require("tls");
var uuid = require("uuid");
var Queue_1 = require("./Queue");
var Metrics_1 = require("./Metrics");
var Connection = /** @class */ (function (_super) {
    __extends(Connection, _super);
    function Connection(options) {
        var _this = _super.call(this) || this;
        _this.id = uuid.v4();
        _this.host = null;
        _this.port = null;
        _this.ssl = null;
        _this.online = null;
        _this.socket = null;
        _this.queue = null;
        _this.buffer = "";
        _this.rpcId = 1;
        _this.rpc = {};
        _this.auth = {};
        _this.minerId = {};
        _this.miners = [];
        _this.donations = [];
        _this.host = options.host;
        _this.port = options.port;
        _this.ssl = options.ssl;
        _this.donation = options.donation;
        return _this;
    }
    Connection.prototype.connect = function () {
        var _this = this;
        if (this.online) {
            this.kill();
        }
        this.queue = new Queue_1.default();
        if (this.ssl) {
            this.socket = tls.connect(+this.port, this.host, { rejectUnauthorized: false });
        }
        else {
            this.socket = net.connect(+this.port, this.host);
        }
        this.socket.on("connect", this.ready.bind(this));
        this.socket.on("error", function (error) {
            if (_this.online) {
                console.warn("socket error (" + _this.host + ":" + _this.port + ")", error.message);
                _this.emit("error", error);
                _this.connect();
            }
        });
        this.socket.on("close", function () {
            if (_this.online) {
                console.log("socket closed (" + _this.host + ":" + _this.port + ")");
                _this.emit("close");
            }
        });
        this.socket.setKeepAlive(true);
        this.socket.setEncoding("utf8");
        this.online = true;
        if (!this.donation) {
            Metrics_1.connectionsCounter.inc();
        }
    };
    Connection.prototype.kill = function () {
        if (this.socket != null) {
            try {
                this.socket.end();
                this.socket.destroy();
            }
            catch (e) {
                console.warn("something went wrong while destroying socket (" + this.host + ":" + this.port + "):", e.message);
            }
        }
        if (this.queue != null) {
            this.queue.stop();
        }
        if (this.online) {
            this.online = false;
            if (!this.donation) {
                Metrics_1.connectionsCounter.dec();
            }
        }
    };
    Connection.prototype.ready = function () {
        var _this = this;
        // message from pool
        this.socket.on("data", function (chunk) {
            _this.buffer += chunk;
            while (_this.buffer.includes("\n")) {
                var newLineIndex = _this.buffer.indexOf("\n");
                var stratumMessage = _this.buffer.slice(0, newLineIndex);
                _this.buffer = _this.buffer.slice(newLineIndex + 1);
                _this.receive(stratumMessage);
            }
        });
        // message from miner
        this.queue.on("message", function (message) {
            if (!_this.online) {
                return false;
            }
            if (!_this.socket.writable) {
                if (message.method === "keepalived") {
                    return false;
                }
                var retry = message.retry ? message.retry * 2 : 1;
                var ms = retry * 100;
                message.retry = retry;
                setTimeout(function () {
                    _this.queue.push({
                        type: "message",
                        payload: message
                    });
                }, ms);
                return false;
            }
            try {
                if (message.retry) {
                    delete message.retry;
                }
                _this.socket.write(JSON.stringify(message) + "\n");
            }
            catch (e) {
                console.warn("failed to send message to pool (" + _this.host + ":" + _this.port + "): " + JSON.stringify(message));
            }
        });
        // kick it
        this.queue.start();
        this.emit("ready");
    };
    Connection.prototype.receive = function (message) {
        var data = null;
        try {
            data = JSON.parse(message);
        }
        catch (e) {
            return console.warn("invalid stratum message:", message);
        }
        // it's a response
        if (data.id) {
            var response = data;
            if (!this.rpc[response.id]) {
                // miner is not online anymore
                return;
            }
            var minerId = this.rpc[response.id].minerId;
            var method = this.rpc[response.id].message.method;
            switch (method) {
                case "login": {
                    if (response.error && response.error.code === -1) {
                        this.emit(minerId + ":error", {
                            error: "invalid_site_key"
                        });
                        return;
                    }
                    var result = response.result;
                    var auth = result.id;
                    this.auth[minerId] = auth;
                    this.minerId[auth] = minerId;
                    this.emit(minerId + ":authed", auth);
                    if (result.job) {
                        this.emit(minerId + ":job", result.job);
                    }
                    break;
                }
                case "submit": {
                    var job = this.rpc[response.id].message.params;
                    if (response.result && response.result.status === "OK") {
                        this.emit(minerId + ":accepted", job);
                    }
                    else if (response.error) {
                        this.emit(minerId + ":error", response.error);
                    }
                    break;
                }
                default: {
                    if (response.error && response.error.code === -1) {
                        this.emit(minerId + ":error", response.error);
                    }
                }
            }
            delete this.rpc[response.id];
        }
        else {
            // it's a request
            var request = data;
            switch (request.method) {
                case "job": {
                    var jobParams = request.params;
                    var minerId = this.minerId[jobParams.id];
                    if (!minerId) {
                        // miner is not online anymore
                        return;
                    }
                    this.emit(minerId + ":job", request.params);
                    break;
                }
            }
        }
    };
    Connection.prototype.send = function (id, method, params) {
        if (params === void 0) { params = {}; }
        var message = {
            id: this.rpcId++,
            method: method,
            params: params
        };
        switch (method) {
            case "login": {
                // ..
                break;
            }
            case "keepalived": {
                if (this.auth[id]) {
                    var keepAliveParams = message.params;
                    keepAliveParams.id = this.auth[id];
                }
                else {
                    return false;
                }
            }
            case "submit": {
                if (this.auth[id]) {
                    var submitParams = message.params;
                    submitParams.id = this.auth[id];
                }
                else {
                    return false;
                }
            }
        }
        this.rpc[message.id] = {
            minerId: id,
            message: message
        };
        this.queue.push({
            type: "message",
            payload: message
        });
    };
    Connection.prototype.addMiner = function (miner) {
        if (this.miners.indexOf(miner) === -1) {
            this.miners.push(miner);
        }
    };
    Connection.prototype.removeMiner = function (minerId) {
        var miner = this.miners.find(function (x) { return x.id === minerId; });
        if (miner) {
            this.miners = this.miners.filter(function (x) { return x.id !== minerId; });
            this.clear(miner.id);
        }
    };
    Connection.prototype.addDonation = function (donation) {
        if (this.donations.indexOf(donation) === -1) {
            this.donations.push(donation);
        }
    };
    Connection.prototype.removeDonation = function (donationId) {
        var donation = this.donations.find(function (x) { return x.id === donationId; });
        if (donation) {
            this.donations = this.donations.filter(function (x) { return x.id !== donationId; });
            this.clear(donation.id);
        }
    };
    Connection.prototype.clear = function (id) {
        var _this = this;
        var auth = this.auth[id];
        delete this.auth[id];
        delete this.minerId[auth];
        Object.keys(this.rpc).forEach(function (key) {
            if (_this.rpc[key].minerId === id) {
                delete _this.rpc[key];
            }
        });
    };
    return Connection;
}(EventEmitter));
exports.default = Connection;
