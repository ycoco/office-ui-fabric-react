/// <reference path="../../../chai/chai.d.ts" />
/// <reference path="../../../mocha/mocha.d.ts" />

import chai = require("chai");
import DomUtils = require('odsp-utilities/domUtils/DomUtils');

var expect = chai.expect;
var assert = chai.assert;

describe('DomUtils', function() {

    describe('findAncestor()', function() {

        it('finds a dom ancestor match', function() {
            var div = document.createElement('div');
            div.className = 'foo';


            var otherDiv = document.createElement('div');
            div.appendChild(otherDiv);

            expect(DomUtils.findAncestor(otherDiv, 'foo')).to.equal(div);
        });

        it('returns null for mismatches', function() {
            var div = document.createElement('div');
            div.className = 'foo';


            var otherDiv = document.createElement('div');
            div.appendChild(otherDiv);

            expect(DomUtils.findAncestor(otherDiv, 'bar')).to.equal(null);
        });
    });

    describe('toggleClass', () => {
        var el: HTMLDivElement;

        beforeEach(() => {
            el = document.createElement('div');
        });

        describe('when isEnabled=true', () => {
            it('adds a class to a DOM element with no classes', () => {
                DomUtils.toggleClass(el, 'foo', true);
                expect(el.className).to.equal('foo');
            });

            it('adds a class to a DOM element with some classes', () => {
                el.className = 'bar';
                DomUtils.toggleClass(el, 'foo', true);
                expect(el.className).to.equal('bar foo');
            });
        });

        describe('when isEnabled=false', () => {
            it('does not add a class to a DOM element with no classes', () => {
                DomUtils.toggleClass(el, 'foo', false);
                expect(el.className).to.equal('');
            });

            it('removes a class from a DOM element', () => {
                el.className = 'foo bar';
                DomUtils.toggleClass(el, 'foo', false);
                expect(el.className).to.equal('bar');
            });
        });
    });

    describe('toggleClass in IE9', () => {
        var el: any;

        beforeEach(() => {
            el = {
                className: ''
            };
        });

        describe('when isEnabled=true', () => {
            it('adds a class to a DOM element with no classes', () => {
                DomUtils.toggleClass(el, 'foo', true);
                expect(el.className).to.equal('foo');
            });

            it('adds a class to a DOM element with some classes', () => {
                el.className = 'bar';
                DomUtils.toggleClass(el, 'foo', true);
                expect(el.className).to.equal('bar foo');
            });
        });

        describe('when isEnabled=false', () => {
            it('does not add a class to a DOM element with no classes', () => {
                DomUtils.toggleClass(el, 'foo', false);
                expect(el.className).to.equal('');
            });

            it('removes a class from a DOM element', () => {
                el.className = 'foo bar';
                DomUtils.toggleClass(el, 'foo', false);
                expect(el.className).to.equal('bar');
            });
        });
    });

    describe('hasClass', () => {
        var el: HTMLDivElement;

        beforeEach(() => {
            el = document.createElement('div');
        });

        it('returns true when class is present', () => {
            el.className = "foo";
            expect(DomUtils.hasClass(el, 'foo')).to.be.true;

            el.className = "bar foo baz";
            expect(DomUtils.hasClass(el, 'foo')).to.be.true;
        });

        it('returns false when class is not present', () => {
            el.className = "";
            expect(DomUtils.hasClass(el, 'foo')).to.be.false;

            el.className = "bar baz";
            expect(DomUtils.hasClass(el, 'foo')).to.be.false;
        });

    });

    describe('setText', () => {
        it('should set the text of the given element', () => {
            var el = document.createElement('div');
            var text = 'sample text';
            assert.strictEqual(el.innerText, '');
            DomUtils.setText(el, text);
            assert.strictEqual(el.innerText, text);
        });
    });

    describe('ce', () => {
        it('creates a basic element', () => {
            var tag = DomUtils.ce('span');
            expect(tag.tagName.toLowerCase()).to.equal('span');
        });

        it('sets attributes', () => {
            var tag = DomUtils.ce('span', { 'data-foo': 'bar', 'data-baz': 'boz' });

            expect(tag.getAttribute('data-foo')).to.equal('bar');
            expect(tag.getAttribute('data-baz')).to.equal('boz');
        });

        it('sets the children, if passed in', () => {
            var childNode1 = DomUtils.ce('p');
            var childNode2 = DomUtils.ce('h1');
            var root = DomUtils.ce('div', {}, [childNode1, childNode2]);
            var childNodes = root.childNodes;
            assert.strictEqual(childNodes.length, 2);
            assert.strictEqual(childNodes[0], childNode1);
            assert.strictEqual(childNodes[1], childNode2);
        });
    });

    describe('ct', () => {
        it('creates a text node', () => {
            var text = 'sample text';
            var createdNode = DomUtils.ct(text);
            assert.strictEqual(createdNode instanceof Text, true);
            assert.strictEqual(createdNode.data, text);
        });
    });

    describe('createComment', () => {
        it('creates a comment node', () => {
            var text = 'sample text';
            var createdNode = DomUtils.createComment(text);
            assert.strictEqual(createdNode instanceof Comment, true);
            assert.strictEqual(createdNode.data, text);
        });
    });

    describe('calculateRect', () => {
        it('can calculate an element rect', () => {
            let div = DomUtils.ce('div');
            let rect = DomUtils.calculateRect(div);

            div.style.display = 'inline-block';
            document.body.appendChild(div);

            try {
                expect(rect.width).to.equal(0);
                expect(rect.height).to.equal(0);

                div.style.marginLeft = '1px';
                div.style.marginRight = '1px';
                div.style.marginTop = '2px';
                div.style.marginBottom = '2px';

                rect = DomUtils.calculateRect(div, true);
                expect(rect.width).to.equal(2);
                expect(rect.height).to.equal(4);
            } finally {
                document.body.removeChild(div);
            }
        });
    });
});
