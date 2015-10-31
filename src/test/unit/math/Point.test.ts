
/// <reference path='../../../mocha/mocha.d.ts' />
/// <reference path='../../../chai/chai.d.ts' />

import Point = require('odsp-utilities/math/Point');
import chai = require('chai');

var expect = chai.expect;

describe('Point', () => {
    var point1: Point;
    var point2: Point;

    describe('#constructor', () => {
        it('takes no arguments', () => {
            point1 = new Point();

            expect(point1.x).to.equal(0);
            expect(point1.y).to.equal(0);
        });

        it('takes x and y', () => {
            point1 = new Point(3, 6);

            expect(point1.x).to.equal(3);
            expect(point1.y).to.equal(6);
        });

        it('takes a point', () => {
            point1 = new Point(4, 8);
            point2 = new Point(point1);

            expect(point2.x).to.equal(point1.x);
            expect(point2.y).to.equal(point1.y);
        });
    });

    describe('#add', () => {
        var point3: Point;

        beforeEach(() => {
            point1 = new Point(2, 7);
            point2 = new Point(5, 13);

            point3 = point1.add(point2);
        });

        it('produces a translated point', () => {
            expect(point3.x).to.equal(7);
            expect(point3.y).to.equal(20);
        });

        it('preserves the first point', () => {
            expect(point1.x).to.equal(2);
            expect(point1.y).to.equal(7);
        });

        it('preserves the second point', () => {
            expect(point2.x).to.equal(5);
            expect(point2.y).to.equal(13);
        });
    });

    describe('#negate', () => {
        beforeEach(() => {
            point1 = new Point(2, -3);
            point2 = point1.negate();
        });

        it('produces a reflected point across the origin', () => {
            expect(point2.x).to.equal(-2);
            expect(point2.y).to.equal(3);
        });

        it('preserves the original point', () => {
            expect(point1.x).to.equal(2);
            expect(point1.y).to.equal(-3);
        });
    });

    describe('#abs', () => {
        it('gets the distance from the origin', () => {
            point1 = new Point(5, 12);

            var distance = point1.abs();

            expect(distance).to.equal(13);
        });
    });

    describe('#scale', () => {
        beforeEach(() => {
            point1 = new Point(7, -4);
            point2 = point1.scale(3);
        });

        it('produces a point scaled from the origin', () => {
            expect(point2.x).to.equal(21);
            expect(point2.y).to.equal(-12);
        });

        it('preserves the original point', () => {
            expect(point1.x).to.equal(7);
            expect(point1.y).to.equal(-4);
        });
    });

    describe('#distance', () => {
        it('produces the absolute value of the difference', () => {
            point1 = new Point(-10, 5);
            point2 = new Point(-5, 17);

            expect(point1.distance(point2)).to.equal(13);
        });
    });

    describe('#subtract', () => {
        it('produces the difference', () => {
            point1 = new Point(4, -6);
            point2 = new Point(9, 3);

            var offset = point1.subtract(point2);

            expect(offset.x).to.equal(-5);
            expect(offset.y).to.equal(-9);
        });
    });
});
