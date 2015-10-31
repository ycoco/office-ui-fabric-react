
/// <reference path='../../../mocha/mocha.d.ts' />
/// <reference path='../../../chai/chai.d.ts' />

import Transform = require('odsp-utilities/math/Transform');
import Point = require('odsp-utilities/math/Point');
import chai = require('chai');

var expect = chai.expect;

describe('Transform', () => {
    var transform: Transform;
    var point: Point;

    beforeEach(() => {
        transform = Transform.IDENTITY;
        point = new Point(3, 5);
    });

    describe('#IDENTITY', () => {
        it('leaves a point intact', () => {
            var result = transform.apply(point);

            expect(result.x).to.equal(point.x);
            expect(result.y).to.equal(point.y);
        });
    });

    describe('#apply', () => {
        it('translates a point', () => {
            transform = new Transform(new Point(1, 2));

            var result = transform.apply(point);

            expect(result.x).to.equal(4); // 3 + 1
            expect(result.y).to.equal(7); // 5 + 2
        });

        it('scales a point', () => {
            transform = new Transform(Point.ORIGIN, 3);

            var result = transform.apply(point);

            expect(result.x).to.equal(9); // 3 * 3
            expect(result.y).to.equal(15); // 3 * 5
        });

        it('scales, then translates a point', () => {
            transform = new Transform(new Point(-2, -4), 2);

            var result = transform.apply(point);

            expect(result.x).to.equal(4); // (3 * 2) - 2
            expect(result.y).to.equal(6); // (5 * 2) - 4
        });
    });

    describe('#multiply', () => {
        it('applies the same as two increments', () => {
            var transform1 = new Transform(new Point(1, 2), 4);
            var transform2 = new Transform(new Point(-3, -5), 0.5);

            var result1 = transform2.apply(transform1.apply(point));
            var result2 = transform2.multiply(transform1).apply(point);

            expect(result2.x).to.equal(result1.x); // (((3 * 4) + 1) * 0.5) - 3
            expect(result2.y).to.equal(result1.y); // (((5 * 4) + 2) * 0.5) - 5
        });
    });

    describe('#invert', () => {
        it('produces an inverse', () => {
            transform = new Transform(new Point(-2, -4), 2);

            var result = transform.invert().multiply(transform).apply(point);

            expect(result.x).to.equal(point.x);
            expect(result.y).to.equal(point.y);
        });
    });
});
