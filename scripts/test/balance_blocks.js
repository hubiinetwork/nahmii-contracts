const assert = require('assert');

const chai = require('chai');
chai.should();

describe('balanceBlocksIn()', () => {
    let n, b, beta;

    describe('N = 5', () => {
        before(() => {
            n = stepArray(5, 10, 10); // balance block number
            b = stepArray(5, 100, 100); // balance
            beta = balanceBlockArray(n, b); // balance block
            logArrays(n, b, beta);
            // Plot of b(n) at https://plot.ly/~jijordre/1/#plot
        });

        describe('(15, 45): s > n_(0) and e < n_(N-1)', () => {
            it('should equal (1000/2) + 2000 + 3000 + (4000/2)', () => {
                const result = balanceBlocksIn(15, 45, n, b, beta);
                result.should.equal(7500);
            });
        });

        describe('(20, 45): s = n_(k)', () => {
            it('should equal 2000 + 3000 + (4000/2)', () => {
                const result = balanceBlocksIn(20, 45, n, b, beta);
                result.should.equal(7000);
            });
        });

        describe('(15, 40): e = n_(l)', () => {
            it('should equal (1000/5) + 2000 + 3000', () => {
                const result = balanceBlocksIn(15, 40, n, b, beta);
                result.should.equal(5500);
            });
        });

        describe('(5, 45): s < n_(0)', () => {
            it('should equal 0 + 1000 + 2000 + 3000 + (4000/2)', () => {
                const result = balanceBlocksIn(5, 45, n, b, beta);
                result.should.equal(8000);
            });
        });

        describe('(15, 55) e > n_(N-1)', () => {
            it('should equal (1000/5) + 2000 + 3000 + 4000 + (500*5)', () => {
                const result = balanceBlocksIn(15, 55, n, b, beta);
                result.should.equal(12000);
            });
        });

        describe('(10, 45): s = n_(0)', () => {
            it('should equal 1000 + 2000 + 3000 + (4000/2)', () => {
                const result = balanceBlocksIn(10, 45, n, b, beta);
                result.should.equal(8000);
            });
        });

        describe('(15, 50): e = n_(N-1)', () => {
            it('should equal (1000/5) + 2000 + 3000 + 4000', () => {
                const result = balanceBlocksIn(15, 50, n, b, beta);
                result.should.equal(9500);
            });
        });

        describe('(55, 60): s > n_(N-1)', () => {
            it('should equal (500*5)', () => {
                const result = balanceBlocksIn(55, 60, n, b, beta);
                result.should.equal(2500);
            });
        });

        describe('(0, 5): e < n_(0)', () => {
            it('should equal 0', () => {
                const result = balanceBlocksIn(0, 5, n, b, beta);
                result.should.equal(0);
            });
        });

        describe('(50, 60): s = n_(N-1)', () => {
            it('should equal (500*10)', () => {
                const result = balanceBlocksIn(50, 60, n, b, beta);
                result.should.equal(5000);
            });
        });

        describe('(0, 10): e = n_(0)', () => {
            it('should equal 0', () => {
                const result = balanceBlocksIn(0, 10, n, b, beta);
                result.should.equal(0);
            });
        });

        describe('(25, 25): s = e', () => {
            it('should equal 0', () => {
                const result = balanceBlocksIn(25, 25, n, b, beta);
                result.should.equal(0)
            });
        });

        describe('(35, 25): s > e', () => {
            it('should equal 0', () => {
                const result = balanceBlocksIn(35, 25, n, b, beta);
                result.should.equal(0)
            });
        });

        describe('(10, 15): s = n[k], e < n[k+1]', () => {
            it('should equal (100*5)', () => {
                const result = balanceBlocksIn(10, 15, n, b, beta);
                result.should.equal(500)
            });
        });

        describe('(11, 15): n[k] < s, e < n[k+1]', () => {
            it('should equal (100*4)', () => {
                const result = balanceBlocksIn(11, 15, n, b, beta);
                result.should.equal(400)
            });
        });

        describe('(11, 20): n[k] < s, e = n[k+1]', () => {
            it('should equal (100*9)', () => {
                const result = balanceBlocksIn(11, 20, n, b, beta);
                result.should.equal(900)
            });
        });
    });

    describe('N = 1', () => {
        before(() => {
            n = stepArray(1, 10, 10); // balance block number
            b = stepArray(1, 100, 100); // balance
            beta = balanceBlockArray(n, b); // balance block
            logArrays(n, b, beta);
        });

        describe('(5, 15): s < n_(0) < e', () => {
            it('should equal 0', () => {
                const result = balanceBlocksIn(5, 15, n, b, beta);
                result.should.equal(500);
            });
        });
    });

    describe('N = 0', () => {
        before(() => {
            n = stepArray(0); // balance block number
            b = stepArray(0); // balance
            beta = balanceBlockArray(n, b); // balance block
            logArrays(n, b, beta);
        });

        describe('(5, 15)', () => {
            it('should equal 0', () => {
                const result = balanceBlocksIn(null, null, n, b, beta);
                result.should.equal(0);
            });
        });
    });
});

const balanceBlocksIn = (s, e, n, b, beta) => { // s: start, e: end
    assert(b.length == n.length);
    assert(b.length == beta.length);

    const N = b.length;

    let r = 0; // result

    if (N == 0 || s >= e || e < n[0])
        return r;

    let i = 0;

    while (n[i] < s && i < N)
        i++;

    if (i >= N)
        r = b[N - 1] * (e - s);

    else {
        const l = (i == 0 ? s : n[i - 1]);
        const h = Math.min(e, n[i]);

        r = (0 == h - s ? 0 : beta[i] * (h - s) / (n[i] - l));
        i++;

        while (n[i] < e && i < N) {
            r += beta[i];
            i++;
        }

        if (i >= N)
            r += b[N - 1] * (e - n[N - 1]);
        else if (e > n[i - 1])
            r += beta[i] * (e - n[i - 1]) / (n[i] - n[i - 1]);
    }
    return r;
};

// Generate balance and balance block number arrays
const stepArray = (N, start, step = 100) => {
    const arr = [];
    for (let i = 0; i < N; i++) {
        arr.push(start + i * step);
    }
    return arr;
};

const balanceBlockArray = (n, b) => {
    assert(b.length == n.length);
    const N = b.length;
    const arr = [];
    if (0 == N)
        return arr;
    for (let i = 0; i < N; i++) {
        if (0 < i)
            arr.push(b[i - 1] * (n[i] - n[i - 1]));
        else
            arr.push(0);
    }
    return arr;
};
// const balanceBlockArray = (n, b) => {
//     assert(b.length == n.length);
//     const N = b.length;
//     const arr = [];
//     if (0 == N)
//         return arr;
//     arr.push(0);
//     for (let i = 1; i < N; i++) {
//         arr.push(b[i - 1] * (n[i] - n[i - 1]));
//     }
//     return arr;
// };

const logArrays = (n, b, beta) => {
    console.log(`\tbalance block number: ${n.length ? n.map((e, i) => `n_(${i}) = ${e}`).join(', ') : '(none)'}`);
    console.log(`\t             balance: ${b.length ? b.map((e, i) => `b_(${i}) = ${e}`).join(', ') : '(none)'}`);
    console.log(`\t       balance block: ${beta.length ? beta.map((e, i) => `beta_(${i}) = ${e}`).join(', ') : '(none)'}`);
};
