/// <reference types="node" />
import Connection from "./Connection";
import { Job, StratumError, StratumJob, TakenJob } from "./types";
export declare type Options = {
    address: string;
    host: string;
    port: number;
    pass: string;
    percentage: number;
    connection: Connection;
};
declare class Donation {
    id: string;
    address: string;
    host: string;
    port: number;
    user: string;
    pass: string;
    percentage: number;
    connection: Connection;
    online: boolean;
    jobs: Job[];
    taken: TakenJob[];
    heartbeat: NodeJS.Timer;
    ready: Promise<void>;
    resolver: () => void;
    resolved: boolean;
    shouldDonateNextTime: boolean;
    constructor(options: Options);
    connect(): void;
    kill(): void;
    submit(job: Job): void;
    handleJob(job: Job): void;
    getJob(): Job;
    shouldDonateJob(): boolean;
    hasJob(job: Job): boolean;
    handleAccepted(job: StratumJob): void;
    handleError(error: StratumError): void;
}
export default Donation;
