/// <reference types="node" />
export declare type Dictionary<T> = {
    [key: string]: T;
};
export declare type Job = {
    blob: string;
    job_id: string;
    target: string;
    id: string;
};
export declare type TakenJob = Job & {
    done: boolean;
};
export declare type Stats = {
    miners: MinerStats[];
    connections: ConnectionStats[];
};
export declare type MinerStats = {
    id: string;
    login: string | null;
    hashes: number;
};
export declare type ConnectionStats = {
    id: string;
    host: string;
    port: string;
    miners: number;
};
export declare type WebSocketQuery = {
    id?: string;
    pool?: string;
};
export declare type QueueMessage = {
    type: string;
    payload: any;
};
export declare type RPCMessage = {
    minerId: string;
    message: StratumRequest;
};
export declare type Socket = NodeJS.Socket & {
    destroy: () => void;
    setKeepAlive: (value: boolean) => void;
};
export declare type Credentials = {
    user: string;
    pass: string;
};
export declare type CoinHiveRequest = {
    type: string;
    params: CoinHiveLoginParams | CoinHiveJob;
};
export declare type CoinHiveLoginParams = {
    site_key: string;
    user: string | null;
};
export declare type CoinHiveJob = Job;
export declare type CoinHiveResponse = {
    type: string;
    params: CoinHiveLoginResult | CoinHiveSubmitResult | CoinHiveJob | CoinHiveError;
};
export declare type CoinHiveLoginResult = {
    hashes: number;
    token: string | null;
};
export declare type CoinHiveSubmitResult = {
    hashes: number;
};
export declare type CoinHiveError = {
    error: string;
};
export declare type StratumRequest = {
    id: number;
    method: string;
    params: StratumRequestParams;
    retry?: number;
};
export declare type StratumRequestParams = StratumLoginParams | StratumJob | StratumKeepAlive | StratumEmptyParams;
export declare type StratumLoginParams = {
    login: string;
    pass?: string;
};
export declare type StratumJob = Job & {
    id: string;
};
export declare type StratumEmptyParams = {};
export declare type StratumResponse = {
    id: string;
    result: StratumResult;
    error: StratumError;
};
export declare type StratumResult = StratumSubmitResult | StratumLoginResult;
export declare type StratumSubmitResult = {
    status: string;
};
export declare type StratumLoginResult = {
    id: string;
    job: Job;
    status: string;
};
export declare type StratumError = {
    code: number;
    error: string;
};
export declare type StratumKeepAlive = {
    id: string;
};
export declare type OpenEvent = {
    id: string;
};
export declare type AuthedEvent = {
    id: string;
    login: string;
    auth: string;
};
export declare type JobEvent = {
    id: string;
    login: string;
    job: Job;
};
export declare type FoundEvent = {
    id: string;
    login: string;
    job: Job;
};
export declare type AcceptedEvent = {
    id: string;
    login: string;
    hashes: number;
};
export declare type CloseEvent = {
    id: string;
    login: string;
};
export declare type ErrorEvent = {
    id: string;
    login: string;
    error: StratumError;
};
