/// <reference path="../../../chai/chai.d.ts" />
/// <reference path="../../../mocha/mocha.d.ts" />

import chai = require("chai");
import Rectangle = require('../../../local/math/Rectangle');
import Point = require('../../../local/math/Point');
import Size = require('../../../local/math/Size');

var expect = chai.expect;

describe('Rectangle', () => {
    describe('constructor()', () => {
        var rect: Rectangle;

        it('constructs zero value Rectangle for no arguments', () => {
            rect = new Rectangle();
            expect(rect.x).to.equal(0);
            expect(rect.y).to.equal(0);
            expect(rect.width).to.equal(0);
            expect(rect.height).to.equal(0);
        });

        it('constructs an identical Rectangle when passed a Rectangle', () => {
            var rect2 = new Rectangle(1, 2, 3, 4);
            rect = new Rectangle(rect2);
            expect(rect).to.deep.equal(rect2);
        });

        it('constructs a Rectangle from specified Point and Size arguments', () => {
            var point = new Point(10, 20);
            var size = new Size(30, 40);
            rect = new Rectangle(point, size);
            expect(rect.x).to.equal(point.x);
            expect(rect.y).to.equal(point.y);
            expect(rect.width).to.equal(size.width);
            expect(rect.height).to.equal(size.height);
        });

        it('constructs a Rectangle from specified coordinate and dimensions', () => {
            rect = new Rectangle(5, 10, 15, 20);
            expect(rect.x).to.equal(5);
            expect(rect.y).to.equal(10);
            expect(rect.width).to.equal(15);
            expect(rect.height).to.equal(20);
        });
    });

    describe('clip()', () => {
        var rect: Rectangle;
        var bounds: Rectangle;

        before(() => {
            rect = new Rectangle(-5, -10, 35, 25);
            bounds = new Rectangle(1, 2, 3, 4);
        });

        it('clips the Rectangle within specified bounds on all sides', () => {
            var result = rect.clip(bounds);
            expect(result.x).to.equal(1);
            expect(result.y).to.equal(2);
            expect(result.width).to.equal(3);
            expect(result.height).to.equal(4);
        });

        it('does not clip Rectangle when it fits within the specified bounds', () => {
            var result = bounds.clip(rect);
            expect(result).to.deep.equal(bounds);
        });
    });

    describe('contains()', () => {
        it('returns true when the specified Point is contained within the Rectangle', () => {
            var p = new Point(-2, 5);
            var rect = new Rectangle(-10, -20, 30, 40);
            expect(rect.contains(p)).to.equal(true);
        });

        it('returns false when the specified Point is NOT contained within the Rectangle', () => {
            var rect = new Rectangle(-10, -20, 30, 40);
            expect(rect.contains(new Point(-20, 5))).to.equal(false);
            expect(rect.contains(new Point(50, 5))).to.equal(false);
            expect(rect.contains(new Point(-2, -25))).to.equal(false);
            expect(rect.contains(new Point(-2, 70))).to.equal(false);
        });

        it('returns true when the specified Rectangle is contained within the Rectangle', () => {
            var rectA = new Rectangle(-10, -20, 40, 50);
            var rectB = new Rectangle(-2, -4, 20, 25);
            expect(rectA.contains(rectB)).to.equal(true);
        });

        it('returns false when the specified Rectangle is NOT contained within the Rectangle', () => {
            var rect = new Rectangle(-10, -20, 30, 40);
            expect(rect.contains(new Rectangle(-11, -20, 30, 40))).to.equal(false);
            expect(rect.contains(new Rectangle(-10, -21, 30, 40))).to.equal(false);
            expect(rect.contains(new Rectangle(-10, -20, 31, 40))).to.equal(false);
            expect(rect.contains(new Rectangle(-10, -20, 30, 41))).to.equal(false);
        });
    });

    describe('nudge()', () => {
        it('nudges the specified Rectangle to fit within the bounds', () => {
            var bounds = new Rectangle(-10, -20, 30, 40);
            var rect = new Rectangle(-15, -25, 20, 20);
            var result = rect.nudge(bounds);
            expect(result.x).to.equal(-10);
            expect(result.y).to.equal(-20);
            expect(result.width).to.equal(20);
            expect(result.height).to.equal(20);
        });
    });

    describe('translate()', () => {
        it('translates the specified Rectangle when passed a Point structure', () => {
            var rect = new Rectangle(0, 5, 15, 10);
            var result = rect.translate(new Point(7, -2));
            expect(result.x).to.equal(7);
            expect(result.y).to.equal(3);
            expect(result.width).to.equal(15);
            expect(result.height).to.equal(10);
        });

        it('translates the specified Rectangle when passed separate coordinates', () => {
            var rect = new Rectangle(0, 5, 10, 15);
            var result = rect.translate(-5, 25);
            expect(result.x).to.equal(-5);
            expect(result.y).to.equal(30);
            expect(result.width).to.equal(10);
            expect(result.height).to.equal(15);
        });
    });

    describe('union()', () => {
        it('returns the smallest Rectangle that contains both rectangles', () => {
            var rectA = new Rectangle(-5, -2, 20, 25);
            var rectB = new Rectangle(0, -15, 30, 45);
            var result = rectA.union(rectB);
            expect(result.x).to.equal(-5);
            expect(result.y).to.equal(-15);
            expect(result.width).to.equal(35);
            expect(result.height).to.equal(45);
        });
    });
});