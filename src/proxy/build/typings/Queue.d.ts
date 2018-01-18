/// <reference types="node" />
import * as EventEmitter from "events";
import { QueueMessage } from "./types";
declare class Queue extends EventEmitter {
    events: QueueMessage[];
    interval: NodeJS.Timer;
    bypassed: boolean;
    ms: number;
    constructor(ms?: number);
    start(): void;
    stop(): void;
    bypass(): void;
    push(event: QueueMessage): void;
}
export default Queue;
