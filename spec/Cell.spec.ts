///<reference path="./typings.d.ts"/>

import {
    Cell,
    getTotalRegistrations
} from '../src/lib/Sodium';

describe('Cell', () => {
    afterEach(() => {
        if (getTotalRegistrations() != 0) {
            throw new Error('listeners were not deregistered');
        }
    });

    it('should test constantCell', () => {
        const c = new Cell<number>(12),
        out : number[] = [],
        kill = c.listen(a => out.push(a));

        kill();

        expect([12]).toEqual(out);
    });

});