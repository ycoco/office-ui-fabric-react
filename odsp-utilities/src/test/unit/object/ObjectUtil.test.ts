
import { serialize, safeSerialize, deepCopy, deepCompare } from '../../../odsp-utilities/object/ObjectUtil';
import { expect } from 'chai';

describe('ObjectUtil', () => {

    describe('#safeSerialize', () => {
        it('handles simple objects', () => {
            var orig = {
                key: 42,
                key2: 'blah',
                key3: null
            };

            var stringified = safeSerialize(orig);
            var copy = JSON.parse(stringified);

            expect(copy).to.deep.equal(orig);
        });

        it('handles exotics', () => {
            var orig = {
                window: window,
                div: document.createElement('div'),
                fn: function sum(a: number, b: number) { return a + b; },
                date: new Date()
            };

            var stringified = safeSerialize(orig);
            var copy = JSON.parse(stringified);

            expect(copy).to.deep.equal({
                window: '[window]',
                div: '[HTMLElement]',
                fn: '[function]',
                date: orig.date.toJSON()
            });
        });

        it('handles circular references', () => {
            var orig = {
                a: 42,
                b: null
            };

            var child = {
                parent: orig
            };

            orig.b = child;

            var stringified = safeSerialize(orig);
            var copy = JSON.parse(stringified);

            expect(copy).to.deep.equal({
                a: 42,
                b: {
                    parent: '[circular]'
                }
            });
        });

        it('handles exceptions', () => {
            var orig = {
                toJSON: function () {
                    throw new Error("oh no!");
                }
            };

            var stringified = safeSerialize(orig);
            expect(stringified).to.equal('"[object]"');
        });
    });

    describe('#deepCopy', () => {
        it('handles simple objects', () => {
            var orig = {
                key: 42,
                key2: 'blah',
                key3: [1, 2, 3]
            };

            var copy = deepCopy(orig);

            expect(copy).to.deep.equal(orig);
        });

        it('handles null', () => {
            var copy = deepCopy(null);
            expect(copy).to.be.null;
        });

        it('throws on circular references', () => {
            var orig = {
                a: 42,
                b: null
            };

            var child = {
                parent: orig
            };

            orig.b = child;

            expect(deepCopy.bind(null, orig)).to.throw(/Cannot perform DeepCopy\(\) because a circular reference was encountered/);
        });
    });

    describe('#serialize', () => {
        it('serializes an object', () => {
            var orig = {
                num: 42,
                str: 'hello'
            };

            var serialized = serialize(orig);

            expect(serialized).to.equal('num=42&str=hello');
        });

        it('handles null and undefined', () => {
            var orig = {
                key: null,
                key2: undefined
            };

            var serialized = serialize(orig);

            expect(serialized).to.equal('key=&key2=');
        });

        it('uses a custom delimiter', () => {
            var orig = {
                num: 42,
                str: 'hello'
            };

            var serialized = serialize(orig, ',');

            expect(serialized).to.equal('num=42,str=hello');
        });

        it('encodes special values', () => {
            var orig = {
                opinion: 'M&Ms are great'
            };

            var serialized = serialize(orig);

            expect(serialized).to.equal('opinion=M%26Ms%20are%20great');
        });

        it('honors skipEncoding', () => {
            var orig = {
                opinion: 'M&Ms are great'
            };

            var serialized = serialize(orig, null, true);

            expect(serialized).to.equal('opinion=M&Ms are great');
        });
    });

    describe('#deepCompare', () => {
        it('handles simple objects', () => {
            var orig = {
                key: 42,
                key2: 'blah',
                key3: [1, 2, 3]
            };

            var copy = deepCopy(orig);
            expect(deepCompare(orig, copy)).to.be.true;
        });

        it('handles simple values', () => {
            expect(deepCompare(42, 42)).to.be.true;
            expect(deepCompare('string', 'string')).to.be.true;
            expect(deepCompare(null, 42)).to.be.false;
            expect(deepCompare({}, null)).to.be.false;
            expect(deepCompare({}, 42)).to.be.false;
        });

        it('objects with different keys', () => {
            var obj1 = {
                a: 42,
                b: 'hello'
            };
            var obj2 = {
                a: 42
            };
            var obj3 = {
                a: 42,
                c: 'hello'
            };
            expect(deepCompare(obj1, obj2)).to.be.false;
            expect(deepCompare(obj2, obj1)).to.be.false;
            expect(deepCompare(obj1, obj3)).to.be.false;
        });

        it('accepts a custom comparison function', () => {
            var obj1 = {
                a: 42
            };
            var obj2 = {
                a: 42
            };

            function falseComparison(arg1: any, arg2: any) {
                expect(arg1).to.equal(obj1.a);
                expect(arg2).to.equal(obj2.a);
                return false;
            }

            function trueComparison(arg1: any, arg2: any) {
                expect(arg1).to.equal(obj1.a);
                expect(arg2).to.equal(obj2.a);
                return true;
            }

            expect(deepCompare(obj1, obj2, falseComparison)).to.be.false;
            expect(deepCompare(obj2, obj1, trueComparison)).to.be.true;
        });

        it('handles deep objects', () => {
            var deep1 = {
                a: {
                    b: {
                        c: 'hello'
                    }
                }
            };
            var deep2 = {
                a: {
                    b: {
                        c: 'world'
                    }
                }
            };
            expect(deepCompare(deep1, deep2)).to.be.false;
            deep2.a.b.c = 'hello';
            expect(deepCompare(deep1, deep2)).to.be.true;
        });

        it('ignores functions', () => {
            var obj1 = {
                a: function() { /* example */ }
            };
            var obj2 = {
                a: "hello"
            };
            expect(deepCompare(obj1, obj2)).to.be.true;
            expect(deepCompare(obj2, obj1)).to.be.true;
        });

        it('throws on circular references', () => {
            var orig = {
                a: 42,
                b: null
            };

            var child = {
                parent: orig
            };

            orig.b = child;

            var similar = {
                a: 42,
                b: {
                    parent: {
                        a: 42,
                        b: {
                            parent: {}
                        }
                    }
                }
            };

            expect(() => {
                deepCompare(orig, similar);
            }).to.throw(/Cannot perform DeepCompare\(\) because a circular reference was encountered/);

             expect(() => {
                deepCompare(similar, orig);
             }).to.throw(/Cannot perform DeepCompare\(\) because a circular reference was encountered/);
        });
    });

});