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
var WebSocket = require("ws");
var url = require("url");
var http = require("http");
var https = require("https");
var defaults = require("../config/defaults");
var Connection_1 = require("./Connection");
var Miner_1 = require("./Miner");
var Donation_1 = require("./Donation");
var Proxy = /** @class */ (function (_super) {
    __extends(Proxy, _super);
    function Proxy(constructorOptions) {
        if (constructorOptions === void 0) { constructorOptions = defaults; }
        var _this = _super.call(this) || this;
        _this.host = null;
        _this.port = null;
        _this.pass = null;
        _this.ssl = null;
        _this.address = null;
        _this.user = null;
        _this.diff = null;
        _this.dynamicPool = false;
        _this.maxMinersPerConnection = 100;
        _this.donations = [];
        _this.connections = {};
        _this.wss = null;
        _this.key = null;
        _this.cert = null;
        _this.path = null;
        _this.server = null;
        _this.credentials = null;
        _this.online = false;
        var options = Object.assign({}, defaults, constructorOptions);
        _this.host = options.host;
        _this.port = options.port;
        _this.pass = options.pass;
        _this.ssl = options.ssl;
        _this.address = options.address;
        _this.user = options.user;
        _this.diff = options.diff;
        _this.dynamicPool = options.dynamicPool;
        _this.maxMinersPerConnection = options.maxMinersPerConnection;
        _this.donations = options.donations;
        _this.key = options.key;
        _this.cert = options.cert;
        _this.path = options.path;
        _this.server = options.server;
        _this.credentials = options.credentials;
        _this.on("error", function (error) {
            /* prevent unhandled proxy errors from stopping the proxy */
            console.error("proxy error:", error.message);
        });
        return _this;
    }
    Proxy.prototype.listen = function (port, host, callback) {
        var _this = this;
        var version = require("../package").version;
        if (this.online) {
            this.kill();
        }
        // create server
        var isHTTPS = !!(this.key && this.cert);
        if (!this.server) {
            var stats = function (req, res) {
                if (_this.credentials) {
                    var auth = require("basic-auth")(req);
                    if (!auth || auth.name !== _this.credentials.user || auth.pass !== _this.credentials.pass) {
                        res.statusCode = 401;
                        res.setHeader("WWW-Authenticate", 'Basic realm="Access to stats"');
                        res.end("Access denied");
                        return;
                    }
                }
                var url = require("url").parse(req.url);
                if (url.pathname === "/ping") {
                    res.statusCode = 200;
                    res.end();
                    return;
                }
                if (url.pathname === "/ready") {
                    res.statusCode = _this.online ? 200 : 503;
                    res.end();
                    return;
                }
                if (url.pathname === "/version") {
                    var body_1 = JSON.stringify({ version: version });
                    res.writeHead(200, {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Length": Buffer.byteLength(body_1),
                        "Content-Type": "application/json",
                    });
                    res.end(body_1);
                    return;
                }
                var proxyStats = _this.getStats();
                var body = JSON.stringify({
                    code: 404,
                    error: "Not Found"
                });
                if (url.pathname === "/stats") {
                    body = JSON.stringify({
                        miners: proxyStats.miners.length,
                        connections: proxyStats.connections.length
                    }, null, 2);
                }
                if (url.pathname === "/miners") {
                    body = JSON.stringify(proxyStats.miners, null, 2);
                }
                if (url.pathname === "/connections") {
                    body = JSON.stringify(proxyStats.connections, null, 2);
                }
                res.writeHead(200, {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Length": Buffer.byteLength(body),
                    "Content-Type": "application/json"
                });
                res.end(body);
            };
            if (isHTTPS) {
                var certificates = {
                    key: this.key,
                    cert: this.cert
                };
                this.server = https.createServer(certificates, stats);
            }
            else {
                this.server = http.createServer(stats);
            }
        }
        var wssOptions = {
            server: this.server
        };
        if (this.path) {
            wssOptions.path = this.path;
        }
        this.wss = new WebSocket.Server(wssOptions);
        this.wss.on("connection", function (ws, req) {
            var params = url.parse(req.url, true).query;
            params.pool = params.id;
            var host = _this.host;
            var port = _this.port;
            var pass = _this.pass;
            if (params.pool && _this.dynamicPool) {
                var split = params.pool.split(":");
                host = split[0] || _this.host;
                port = Number(split[1]) || _this.port;
                pass = split[2] || _this.pass;
                console.log("Miner connected to pool", host);
            }
            var connection = _this.getConnection(host, port);
            var donations = _this.donations.map(function (donation) {
                return new Donation_1.default({
                    address: donation.address,
                    host: donation.host,
                    port: donation.port,
                    pass: donation.pass,
                    percentage: donation.percentage,
                    connection: _this.getConnection(donation.host, donation.port, true)
                });
            });
            var miner = new Miner_1.default({
                connection: connection,
                ws: ws,
                address: _this.address,
                user: _this.user,
                diff: _this.diff,
                pass: pass,
                donations: donations
            });
            miner.on("open", function (data) { return _this.emit("open", data); });
            miner.on("authed", function (data) { return _this.emit("authed", data); });
            miner.on("job", function (data) { return _this.emit("job", data); });
            miner.on("found", function (data) { return _this.emit("found", data); });
            miner.on("accepted", function (data) { return _this.emit("accepted", data); });
            miner.on("close", function (data) { return _this.emit("close", data); });
            miner.on("error", function (data) { return _this.emit("error", data); });
            miner.connect();
        });
        if (!host && !callback) {
            this.server.listen(port);
        }
        else if (!host && callback) {
            this.server.listen(port, callback);
        }
        else if (host && !callback) {
            this.server.listen(port, host);
        }
        else {
            this.server.listen(port, host, callback);
        }
        this.wss.on("listening", function () {
            _this.online = true;
            console.log("listening on port " + port + (isHTTPS ? ", using a secure connection" : ""));
            console.log("miners per connection:", _this.maxMinersPerConnection);
            if (wssOptions.path) {
                console.log("path: " + wssOptions.path);
            }
            if (!_this.dynamicPool) {
                console.log("host: " + _this.host);
                console.log("port: " + _this.port);
                console.log("pass: " + _this.pass);
            }
        });
    };
    Proxy.prototype.getConnection = function (host, port, donation) {
        var _this = this;
        if (donation === void 0) { donation = false; }
        var connectionId = host + ":" + port;
        if (!this.connections[connectionId]) {
            this.connections[connectionId] = [];
        }
        var connections = this.connections[connectionId];
        var availableConnections = connections.filter(function (connection) { return _this.isAvailable(connection); });
        if (availableConnections.length === 0) {
            var connection = new Connection_1.default({ host: host, port: port, ssl: this.ssl, donation: donation });
            connection.connect();
            connection.on("close", function () {
                console.log("connection closed (" + connectionId + ")");
            });
            connection.on("error", function (error) {
                console.log("connection error (" + connectionId + "):", error.message);
            });
            connections.push(connection);
            return connection;
        }
        return availableConnections.pop();
    };
    Proxy.prototype.isAvailable = function (connection) {
        return (connection.miners.length < this.maxMinersPerConnection &&
            connection.donations.length < this.maxMinersPerConnection);
    };
    Proxy.prototype.isEmpty = function (connection) {
        return connection.miners.length === 0 && connection.donations.length === 0;
    };
    Proxy.prototype.getStats = function () {
        var _this = this;
        return Object.keys(this.connections).reduce(function (stats, key) { return ({
            miners: stats.miners.concat(_this.connections[key].reduce(function (miners, connection) { return miners.concat(connection.miners.map(function (miner) { return ({
                id: miner.id,
                login: miner.login,
                hashes: miner.hashes
            }); })); }, [])),
            connections: stats.connections.concat(_this.connections[key].filter(function (connection) { return !connection.donation; }).map(function (connection) { return ({
                id: connection.id,
                host: connection.host,
                port: connection.port,
                miners: connection.miners.length
            }); }))
        }); }, {
            miners: [],
            connections: []
        });
    };
    Proxy.prototype.kill = function () {
        var _this = this;
        Object.keys(this.connections).forEach(function (connectionId) {
            var connections = _this.connections[connectionId];
            connections.forEach(function (connection) {
                connection.kill();
                connection.miners.forEach(function (miner) { return miner.kill(); });
            });
        });
        this.wss.close();
        this.online = false;
        console.log("\uD83D\uDC80");
    };
    return Proxy;
}(EventEmitter));
exports.default = Proxy;
