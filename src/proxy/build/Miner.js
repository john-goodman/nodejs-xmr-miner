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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter = require("events");
var WebSocket = require("ws");
var uuid = require("uuid");
var Queue_1 = require("./Queue");
var Metrics_1 = require("./Metrics");
var Miner = /** @class */ (function (_super) {
    __extends(Miner, _super);
    function Miner(options) {
        var _this = _super.call(this) || this;
        _this.id = uuid.v4();
        _this.login = null;
        _this.address = null;
        _this.user = null;
        _this.diff = null;
        _this.pass = null;
        _this.donations = null;
        _this.heartbeat = null;
        _this.connection = null;
        _this.queue = new Queue_1.default();
        _this.ws = null;
        _this.online = false;
        _this.jobs = [];
        _this.hashes = 0;
        _this.connection = options.connection;
        _this.ws = options.ws;
        _this.address = options.address;
        _this.user = options.user;
        _this.diff = options.diff;
        _this.pass = options.pass;
        _this.donations = options.donations;
        return _this;
    }
    Miner.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("miner connected (" + this.id + ")");
                        Metrics_1.minersCounter.inc();
                        this.donations.forEach(function (donation) { return donation.connect(); });
                        this.ws.on("message", this.handleMessage.bind(this));
                        this.ws.on("close", function () {
                            if (_this.online) {
                                console.log("miner connection closed (" + _this.id + ")");
                                _this.kill();
                            }
                        });
                        this.ws.on("error", function (error) {
                            if (_this.online) {
                                console.log("miner connection error (" + _this.id + "):", error.message);
                                _this.kill();
                            }
                        });
                        this.connection.addMiner(this);
                        this.connection.on(this.id + ":authed", this.handleAuthed.bind(this));
                        this.connection.on(this.id + ":job", this.handleJob.bind(this));
                        this.connection.on(this.id + ":accepted", this.handleAccepted.bind(this));
                        this.connection.on(this.id + ":error", this.handleError.bind(this));
                        this.queue.on("message", function (message) {
                            return _this.connection.send(_this.id, message.method, message.params);
                        });
                        this.heartbeat = setInterval(function () { return _this.connection.send(_this.id, "keepalived"); }, 30000);
                        this.online = true;
                        return [4 /*yield*/, Promise.all(this.donations.map(function (donation) { return donation.ready; }))];
                    case 1:
                        _a.sent();
                        if (this.online) {
                            this.queue.start();
                            this.emit("open", {
                                id: this.id
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Miner.prototype.kill = function () {
        this.queue.stop();
        this.connection.removeMiner(this.id);
        this.connection.removeAllListeners(this.id + ":authed");
        this.connection.removeAllListeners(this.id + ":job");
        this.connection.removeAllListeners(this.id + ":accepted");
        this.connection.removeAllListeners(this.id + ":error");
        this.donations.forEach(function (donation) { return donation.kill(); });
        this.jobs = [];
        this.donations = [];
        this.hashes = 0;
        this.ws.close();
        if (this.heartbeat) {
            clearInterval(this.heartbeat);
            this.heartbeat = null;
        }
        if (this.online) {
            this.online = false;
            Metrics_1.minersCounter.dec();
            console.log("miner disconnected (" + this.id + ")");
            this.emit("close", {
                id: this.id,
                login: this.login
            });
        }
        this.removeAllListeners();
    };
    Miner.prototype.sendToMiner = function (payload) {
        var coinhiveMessage = JSON.stringify(payload);
        if (this.online && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(coinhiveMessage);
            }
            catch (e) {
                this.kill();
            }
        }
    };
    Miner.prototype.sendToPool = function (method, params) {
        this.queue.push({
            type: "message",
            payload: {
                method: method,
                params: params
            }
        });
    };
    Miner.prototype.handleAuthed = function (auth) {
        console.log("miner authenticated (" + this.id + "):", auth);
        this.sendToMiner({
            type: "authed",
            params: {
                token: "",
                hashes: 0
            }
        });
        this.emit("authed", {
            id: this.id,
            login: this.login,
            auth: auth
        });
    };
    Miner.prototype.handleJob = function (job) {
        var _this = this;
        console.log("job arrived (" + this.id + "):", job.job_id);
        this.jobs.push(job);
        var donations = this.donations.filter(function (donation) { return donation.shouldDonateJob(); });
        donations.forEach(function (donation) {
            _this.sendToMiner({
                type: "job",
                params: donation.getJob()
            });
        });
        if (!this.hasPendingDonations() && donations.length === 0) {
            this.sendToMiner({
                type: "job",
                params: this.jobs.pop()
            });
        }
        this.emit("job", {
            id: this.id,
            login: this.login,
            job: job
        });
    };
    Miner.prototype.handleAccepted = function (job) {
        this.hashes++;
        console.log("shares accepted (" + this.id + "):", this.hashes);
        Metrics_1.sharesCounter.inc();
        Metrics_1.sharesMeter.mark();
        this.sendToMiner({
            type: "hash_accepted",
            params: {
                hashes: this.hashes
            }
        });
        this.emit("accepted", {
            id: this.id,
            login: this.login,
            hashes: this.hashes
        });
    };
    Miner.prototype.handleError = function (error) {
        console.warn("pool connection error (" + this.id + "):", error.error || (error && JSON.stringify(error)) || "unknown error");
        if (this.online) {
            if (error.error === "invalid_site_key") {
                this.sendToMiner({
                    type: "error",
                    params: error
                });
            }
            this.emit("error", {
                id: this.id,
                login: this.login,
                error: error
            });
        }
        this.kill();
    };
    Miner.prototype.handleMessage = function (message) {
        var data;
        try {
            data = JSON.parse(message);
        }
        catch (e) {
            console.warn("can't parse message as JSON from miner:", message, e.message);
            return;
        }
        switch (data.type) {
            case "auth": {
                var params = data.params;
                this.login = this.address || params.site_key;
                var user = this.user || params.user;
                if (user) {
                    this.login += "." + user;
                }
                if (this.diff) {
                    this.login += "+" + this.diff;
                }
                this.sendToPool("login", {
                    login: this.login,
                    pass: this.pass
                });
                break;
            }
            case "submit": {
                var job = data.params;
                console.log("job submitted (" + this.id + "):", job.job_id);
                if (!this.isDonation(job)) {
                    this.sendToPool("submit", job);
                }
                else {
                    var donation = this.getDonation(job);
                    donation.submit(job);
                    this.sendToMiner({
                        type: "hash_accepted",
                        params: {
                            hashes: ++this.hashes
                        }
                    });
                }
                this.emit("found", {
                    id: this.id,
                    login: this.login,
                    job: job
                });
                break;
            }
        }
    };
    Miner.prototype.isDonation = function (job) {
        return this.donations.some(function (donation) { return donation.hasJob(job); });
    };
    Miner.prototype.getDonation = function (job) {
        return this.donations.find(function (donation) { return donation.hasJob(job); });
    };
    Miner.prototype.hasPendingDonations = function () {
        return this.donations.some(function (donation) { return donation.taken.filter(function (job) { return !job.done; }).length > 0; });
    };
    return Miner;
}(EventEmitter));
exports.default = Miner;
