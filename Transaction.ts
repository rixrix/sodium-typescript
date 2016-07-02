import { Vertex } from './Vertex';
import * as Collections from 'typescript-collections';

export class Entry {
    constructor(rank : Vertex, action : () => void) {
        this.rank = rank; 
        this.action = action;
        this.seq = Entry.nextSeq++;
    }
    private static nextSeq : number = 0;
    rank : Vertex;
    action : () => void;
    seq : number;
    toString() : string {
        return this.seq.toString();
    }
}

export class Transaction {
    constructor() {
    }
    inCallback : number = 0;
    private toRegen : boolean = false;
    requestRegen() : void { this.toRegen = true; }
    prioritizedQ : Collections.PriorityQueue<Entry> = new Collections.PriorityQueue<Entry>((a, b) => {
        // Note: Low priority numbers are treated as "greater" according to this
        // comparison, so that the lowest numbers are highest priority and go first.
        if (a.rank.rank < b.rank.rank) return 1;
        if (a.rank.rank > b.rank.rank) return -1;
        if (a.seq < b.seq) return 1;
        if (a.seq > b.seq) return -1;
        return 0;
    });
    private entries : Collections.Set<Entry> = new Collections.Set<Entry>((a) => a.toString());
    private lastQ : Array<() => void> = [];
    private postQ : Array<() => void> = null;

    prioritized(target : Vertex, f : () => void) : void {
        this.prioritizedQ.enqueue(new Entry(target, f));
    }
    
    last(h : () => void) : void {
        this.lastQ.push(h);
    }

	// If the priority queue has entries in it when we modify any of the nodes'
	// ranks, then we need to re-generate it to make sure it's up-to-date.
	private checkRegen() : void
	{
	    if (this.toRegen) {
	        this.toRegen = false;
	        this.prioritizedQ.clear();
	        const es = this.entries.toArray();
	        for (let i : number = 0; i < es.length; i++)
	            this.prioritizedQ.enqueue(es[i]);
	    }
	}

    close() : void {
	    while (true) {
	        this.checkRegen();
		    if (this.prioritizedQ.isEmpty()) break;
		    const e = this.prioritizedQ.dequeue();
			e.action();
		}
		for (let i = 0; i < this.lastQ.length; i++)
		    this.lastQ[i]();
        this.lastQ = [];
		if (this.postQ != null) {
		    for (let i = 0; i < this.postQ.length; i++) {
		        if (this.postQ[i] != null) {
                    const parent = currentTransaction;
                    try {
                        if (i > 0) {
                            currentTransaction = new Transaction();
                            try {
                                this.postQ[i]();
                                currentTransaction.close();
                            }
                            catch (err) {
                                currentTransaction.close();
                                throw err;
                            }
                        }
                        else {
                            currentTransaction = null;
                            this.postQ[i]();
                        }
                        currentTransaction = parent;
                    }
                    catch (err) {
                        currentTransaction = parent;
                        throw err;
                    }
                }
            }
            this.postQ = null;
		}
    }
}

export let currentTransaction : Transaction = null;

export function transactionally<A>(f : () => A) : A {
    let transWas : Transaction = currentTransaction;
    if (transWas === null)
        currentTransaction = new Transaction();
    try {
        let a : A = f();
        if (transWas === null) {
            currentTransaction.close();
            currentTransaction = null;
        }
        return a;
    }
    catch (err) {
        if (transWas === null) {
            currentTransaction.close();
            currentTransaction = null;
        }
        throw err;
    }
}
