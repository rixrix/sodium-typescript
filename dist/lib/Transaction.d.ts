import { Vertex } from './Vertex';
import { PriorityQueue } from 'typescript-collections';
export declare class Entry {
    constructor(rank: Vertex, action: () => void);
    private static nextSeq;
    rank: Vertex;
    action: () => void;
    seq: number;
    toString(): string;
}
export declare class Transaction {
    constructor();
    inCallback: number;
    private toRegen;
    requestRegen(): void;
    prioritizedQ: PriorityQueue<Entry>;
    private entries;
    private lastQ;
    private postQ;
    prioritized(target: Vertex, f: () => void): void;
    last(h: () => void): void;
    /**
     * Add an action to run after all last() actions.
     */
    post(childIx: number, action: () => void): void;
    private checkRegen();
    close(): void;
    /**
     * Add a runnable that will be executed whenever a transaction is started.
     * That runnable may start transactions itself, which will not cause the
     * hooks to be run recursively.
     *
     * The main use case of this is the implementation of a time/alarm system.
     */
    static onStart(r: () => void): void;
}
export declare let currentTransaction: Transaction;
export declare function transactionally<A>(f: () => A): A;
