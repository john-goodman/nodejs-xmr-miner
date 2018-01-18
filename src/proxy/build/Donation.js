"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var uuid = require("uuid");
var Donation = /** @class */ (function () {
    function Donation(options) {
        this.id = uuid.v4();
        this.address = null;
        this.host = null;
        this.port = null;
        this.user = null;
        this.pass = null;
        this.percentage = null;
        this.connection = null;
        this.online = false;
        this.jobs = [];
        this.taken = [];
        this.heartbeat = null;
        this.ready = null;
        this.resolver = null;
        this.resolved = false;
        this.shouldDonateNextTime = false;
        this.address = options.address;
        this.host = options.host;
        this.port = options.port;
        this.pass = options.pass;
        this.percentage = options.percentage;
        this.connection = options.connection;
    }
    Donation.prototype.connect = function () {
        var _this = this;
        if (this.online) {
            this.kill();
        }
        this.ready = new Promise(function (resolve) {
            _this.resolved = false;
            _this.resolver = resolve;
        });
        var login = this.address;
        if (this.user) {
            login += "." + this.user;
        }
        this.connection.addDonation(this);
        this.connection.send(this.id, "login", {
            login: login,
            pass: this.pass
        });
        this.connection.on(this.id + ":job", this.handleJob.bind(this));
        this.connection.on(this.id + ":error", this.handleError.bind(this));
        this.connection.on(this.id + ":accepted", this.handleAccepted.bind(this));
        this.heartbeat = setInterval(function () { return _this.connection.send(_this.id, "keepalived"); }, 30000);
        this.online = true;
        setTimeout(function () {
            if (!_this.resolved) {
                _this.resolved = true;
                _this.resolver();
            }
        }, 5000);
    };
    Donation.prototype.kill = function () {
        this.connection.removeDonation(this.id);
        this.connection.removeAllListeners(this.id + ":job");
        this.connection.removeAllListeners(this.id + ":error");
        this.connection.removeAllListeners(this.id + ":accepted");
        this.jobs = [];
        this.taken = [];
        if (this.heartbeat) {
            clearInterval(this.heartbeat);
            this.heartbeat = null;
        }
        this.online = false;
        this.resolved = false;
    };
    Donation.prototype.submit = function (job) {
        this.connection.send(this.id, "submit", job);
    };
    Donation.prototype.handleJob = function (job) {
        this.jobs.push(job);
        if (!this.resolved) {
            this.resolver();
            this.resolved = true;
        }
    };
    Donation.prototype.getJob = function () {
        var job = this.jobs.pop();
        this.taken.push(__assign({}, job, { done: false }));
        return job;
    };
    Donation.prototype.shouldDonateJob = function () {
        var chances = Math.random();
        var shouldDonateJob = chances <= this.percentage || this.shouldDonateNextTime;
        if (shouldDonateJob && this.jobs.length === 0) {
            this.shouldDonateNextTime = true;
            return false;
        }
        this.shouldDonateNextTime = false;
        return shouldDonateJob;
    };
    Donation.prototype.hasJob = function (job) {
        return this.taken.some(function (j) { return j.job_id === job.job_id; });
    };
    Donation.prototype.handleAccepted = function (job) {
        var finishedJob = this.taken.find(function (j) { return j.job_id === job.job_id; });
        if (finishedJob) {
            finishedJob.done = true;
        }
    };
    Donation.prototype.handleError = function (error) {
        this.connect();
    };
    return Donation;
}());
exports.default = Donation;
