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
var Queue = /** @class */ (function (_super) {
    __extends(Queue, _super);
    function Queue(ms) {
        if (ms === void 0) { ms = 100; }
        var _this = _super.call(this) || this;
        _this.events = [];
        _this.interval = null;
        _this.bypassed = false;
        _this.ms = 100;
        _this.ms = ms;
        return _this;
    }
    Queue.prototype.start = function () {
        var _this = this;
        if (this.interval == null) {
            var that_1 = this;
            this.interval = setInterval(function () {
                var event = that_1.events.pop();
                if (event) {
                    that_1.emit(event.type, event.payload);
                }
                else {
                    _this.bypass();
                }
            }, this.ms);
        }
    };
    Queue.prototype.stop = function () {
        if (this.interval != null) {
            clearInterval(this.interval);
            this.interval = null;
        }
    };
    Queue.prototype.bypass = function () {
        this.bypassed = true;
        this.stop();
    };
    Queue.prototype.push = function (event) {
        if (this.bypassed) {
            this.emit(event.type, event.payload);
        }
        else {
            this.events.push(event);
        }
    };
    return Queue;
}(EventEmitter));
exports.default = Queue;
