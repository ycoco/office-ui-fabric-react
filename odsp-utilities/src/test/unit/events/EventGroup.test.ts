import EventGroup from '../../../odsp-utilities/events/EventGroup';
import sinon = require('sinon');
import { expect } from 'chai';

describe('EventGroup', function() {
    it('can observe an HTML element event', () => {
        var timesCalled = 0;
        var sourceButton = document.createElement('button');
        var parent = {
            cb: function () {
                timesCalled++;
            }
        };
        var eg = new EventGroup(parent);
        var ev = document.createEvent('HTMLEvents');

        eg.on(sourceButton, 'click', parent.cb);
        ev.initEvent('click', true, true);

        sourceButton.dispatchEvent(ev);
        expect(timesCalled).to.equal(1);

        sourceButton.dispatchEvent(ev);
        expect(timesCalled).to.equal(2);

        eg.dispose();

        sourceButton.dispatchEvent(ev);
        expect(timesCalled).to.equal(2);
    });

    it('can observe an object event', () => {
        var timesCalled = 0;
        var sourceObject = {};
        var parent = {
            cb: function () {
                timesCalled++;
            }
        };

        var parentEvents = new EventGroup(parent);
        var sourceEvents = new EventGroup(sourceObject);

        sourceEvents.declare(['foo', 'bar']);

        expect(EventGroup.isDeclared(sourceObject, 'foo')).to.equal(true);
        expect(EventGroup.isDeclared(sourceObject, 'bar')).to.equal(true);
        expect(EventGroup.isDeclared(sourceObject, 'baz')).to.equal(false);

        parentEvents.on(sourceObject, 'foo, bar', parent.cb);

        sourceEvents.raise('foo');
        expect(timesCalled).to.equal(1);

        sourceEvents.raise('bar');
        expect(timesCalled).to.equal(2);

        parentEvents.dispose();

        sourceEvents.raise('thing');
        expect(timesCalled).to.equal(2);
    });

    it('can bubble object events', () => {
        var rootCalled = 0;
        var childCalled = 0;
        var grandChildCalled = 0;
        var childResponse = true;
        var root = {
            cb: function() {
                rootCalled++;
            }
        };
        var child = {
            parent: root,
            cb: function () {
                childCalled++;
                return childResponse;
            }
        };
        var grandChild = {
            parent: child,
            cb: function () {
                grandChildCalled++;
            }
        };
        var rootEvents = new EventGroup(root);
        var childEvents = new EventGroup(child);
        var grandChildEvents = new EventGroup(grandChild);

        rootEvents.on(root, 'foo', root.cb);
        childEvents.on(child, 'foo', child.cb);
        grandChildEvents.on(grandChild, 'foo', grandChild.cb);

        // bubble up to the root.
        grandChildEvents.raise('foo', null, true);

        expect(rootCalled).to.equal(1);
        expect(childCalled).to.equal(1);
        expect(grandChildCalled).to.equal(1);

        // cancel at the child.
        childResponse = false;
        grandChildEvents.raise('foo', null, true);

        expect(rootCalled).to.equal(1);
        expect(childCalled).to.equal(2);
        expect(grandChildCalled).to.equal(2);

        // dispose all.
        rootEvents.dispose();
        childEvents.dispose();
        grandChildEvents.dispose();

        grandChildEvents.raise('foo', null, true);

        expect(rootCalled).to.equal(1);
        expect(childCalled).to.equal(2);
        expect(grandChildCalled).to.equal(2);
    });

    it('can cancelBubble/preventDefault if false is returned on an element event callback', () => {
        var rootCalled = 0;
        var childCalled = 0;
        var childResponse = true;
        var rootDiv = document.createElement('div');
        var childDiv = document.createElement('div');
        var grandChildButton = document.createElement('button');

        var parent = {
            onRootClick: function() {
                rootCalled++;
            },
            onChildClick: function() {
                childCalled++;
                return childResponse;
            }
        };

        var parentEvents = new EventGroup(parent);

        parentEvents.on(childDiv, 'click', parent.onChildClick);
        parentEvents.on(rootDiv, 'click', parent.onRootClick);

        document.body.appendChild(rootDiv).appendChild(childDiv).appendChild(grandChildButton);

        try {
            var ev = document.createEvent('HTMLEvents');

            ev.initEvent('click', true, true);

            grandChildButton.dispatchEvent(ev);

            // verify we bubble.
            expect(childCalled).to.equal(1, 'child not 1');
            expect(rootCalled).to.equal(1);

            // now return false at the child, shouldn't hit root.
            childResponse = false;
            grandChildButton.dispatchEvent(ev);
            expect(childCalled).to.equal(2);
            expect(rootCalled).to.equal(1);

            parentEvents.dispose();

            grandChildButton.dispatchEvent(ev);

            expect(childCalled).to.equal(2);
            expect(rootCalled).to.equal(1);
        } finally {
            document.body.removeChild(rootDiv);

        }
    });

    it('can selectively remove event handlers', () => {
        var cb1Called = 0;
        var cb2Called = 0;
        var sourceObject = {};
        var parent = {
            cb1: function () {
                cb1Called++;
            },
            cb2: function () {
                cb2Called++;
            }
        };

        var parentEvents = new EventGroup(parent);
        var sourceEvents = new EventGroup(sourceObject);

        parentEvents.on(sourceObject, 'foo', parent.cb1);
        parentEvents.on(sourceObject, 'foo', parent.cb2);

        sourceEvents.raise('foo');
        expect(cb1Called).to.equal(1);
        expect(cb1Called).to.equal(1);

        // remove one.
        parentEvents.off(sourceObject, 'foo', parent.cb1);
        sourceEvents.raise('foo');
        expect(cb1Called).to.equal(1);
        expect(cb2Called).to.equal(2);

        // attach it again.
        parentEvents.on(sourceObject, 'foo', parent.cb1);
        sourceEvents.raise('foo');
        expect(cb1Called).to.equal(2);
        expect(cb2Called).to.equal(3);

        // detatch both based on event name.
        parentEvents.off(sourceObject, 'foo');
        sourceEvents.raise('foo');
        expect(cb1Called).to.equal(2);
        expect(cb2Called).to.equal(3);

        // attach it again.
        parentEvents.on(sourceObject, 'foo', parent.cb1);
        parentEvents.on(sourceObject, 'foo', parent.cb2);
        sourceEvents.raise('foo');
        expect(cb1Called).to.equal(3);
        expect(cb2Called).to.equal(4);

        // detach based on object.
        parentEvents.off(sourceObject);
        sourceEvents.raise('foo');
        expect(cb1Called).to.equal(3);
        expect(cb2Called).to.equal(4);
    });

    it('allows event handlers to be disposed', () => {
        let cb1Called = 0;
        let cb2Called = 0;
        const sourceObject = {};
        const parent = {
            cb1: function () {
                cb1Called++;
            },
            cb2: function () {
                cb2Called++;
            }
        };

        const parentEvents = new EventGroup(parent);
        const sourceEvents = new EventGroup(sourceObject);

        const ev1 = parentEvents.on(sourceObject, 'foo', parent.cb1);
        const ev2 = parentEvents.on(sourceObject, 'foo', parent.cb2);

        sourceEvents.raise('foo');
        expect(cb1Called).to.equal(1);
        expect(cb1Called).to.equal(1);

        // remove one.
        ev1.dispose();
        sourceEvents.raise('foo');
        expect(cb1Called).to.equal(1);
        expect(cb2Called).to.equal(2);

        // remove the other.
        ev2.dispose();
        sourceEvents.raise('foo');
        expect(cb1Called).to.equal(1);
        expect(cb2Called).to.equal(2);
    });

    it('allows event handlers to be disposed in bulk', () => {
        let cb1Called = 0;
        let cb2Called = 0;
        const sourceObject = {};
        const parent = {
            cb1: function () {
                cb1Called++;
            },
            cb2: function () {
                cb2Called++;
            }
        };

        const parentEvents = new EventGroup(parent);
        const sourceEvents = new EventGroup(sourceObject);

        const ev = parentEvents.onAll(sourceObject, {
            foo: parent.cb1,
            bar: parent.cb2
        });

        sourceEvents.raise('foo');
        expect(cb1Called).to.equal(1);
        expect(cb2Called).to.equal(0);

        sourceEvents.raise('bar');
        expect(cb1Called).to.equal(1);
        expect(cb2Called).to.equal(1);

        // remove them both.
        ev.dispose();
        sourceEvents.raise('foo');
        expect(cb1Called).to.equal(1);
        expect(cb2Called).to.equal(1);
        sourceEvents.raise('bar');
        expect(cb1Called).to.equal(1);
        expect(cb2Called).to.equal(1);
    });

    it('can raise custom html events', () => {
        var timesCalled = 0;
        var sourceButton = document.createElement('button');
        var parent = {
            cb: function () {
                timesCalled++;
            }
        };
        var eg = new EventGroup(parent);

        eg.on(sourceButton, 'foobar', parent.cb);

        EventGroup.raise(sourceButton, 'foobar');

        expect(timesCalled).to.equal(1);

        EventGroup.raise(sourceButton, 'foobar');
        expect(timesCalled).to.equal(2);

        eg.dispose();

        EventGroup.raise(sourceButton, 'foobar');
        expect(timesCalled).to.equal(2);
    });

    describe('with mocks', () => {
        let parent: {
            cb1: (args: any) => void;
            cb2: (args: any) => void;
        };

        let cb1Stub: sinon.SinonStub;
        let cb2Stub: sinon.SinonStub;

        let eventGroup: EventGroup;

        beforeEach(() => {

            cb1Stub = sinon.stub();
            cb2Stub = sinon.stub();

            parent = {
                cb1: cb1Stub,
                cb2: cb2Stub
            };

            eventGroup = new EventGroup(parent);
        });

        describe('for object events', () => {
            let target: {};

            beforeEach(() => {
                target = {};
            });

            it('executes callback', () => {
                eventGroup.on(target, 'test', parent.cb1);

                EventGroup.raise(target, 'test', {});

                expect(cb1Stub.called).to.be.true;
                expect(cb1Stub.calledOn(parent)).to.be.true;
            });

            it('does not execute callback when disposed', () => {
                eventGroup.on(target, 'test', parent.cb1);
                eventGroup.dispose();

                EventGroup.raise(target, 'test', {});

                expect(cb1Stub.called).to.be.false;
            });

            it('does not add callbacks when disposed', () => {
                eventGroup.dispose();
                eventGroup.on(target, 'test', parent.cb1);

                EventGroup.raise(target, 'test', {});

                expect(cb1Stub.called).to.be.false;
            });

            it('does not execute second callback if disposed via first', () => {
                let cb1Spy = sinon.spy((args: any) => {
                    eventGroup.dispose();
                });

                parent.cb1 = cb1Spy;

                eventGroup.on(target, 'test', parent.cb1);
                eventGroup.on(target, 'test', parent.cb2);

                EventGroup.raise(target, 'test', {});

                expect(cb1Spy.called).to.be.true;
                expect(cb2Stub.called).to.be.false;
            });
        });

        describe('for element events', () => {
            let element: HTMLElement;

            function raiseEvent() {
                let event = document.createEvent('HTMLEvents');

                event.initEvent('click', true, true);

                element.dispatchEvent(event);
            }

            beforeEach(() => {
                element = document.createElement('div');
            });

            it('executes callback', () => {
                eventGroup.on(element, 'click', parent.cb1);

                raiseEvent();

                expect(cb1Stub.called).to.be.true;
                expect(cb1Stub.calledOn(parent)).to.be.true;
            });

            it('does not execute callback when disposed', () => {
                eventGroup.on(element, 'click', parent.cb1);
                eventGroup.dispose();

                raiseEvent();

                expect(cb1Stub.called).to.be.false;
            });

            it('does not add callbacks when disposed', () => {
                eventGroup.dispose();
                eventGroup.on(element, 'click', parent.cb1);

                raiseEvent();

                expect(cb1Stub.called).to.be.false;
            });

            it('does not execute second callback if disposed via first', () => {
                let cb1Spy = sinon.spy((args: any) => {
                    eventGroup.dispose();
                });

                parent.cb1 = cb1Spy;

                eventGroup.on(element, 'click', parent.cb1);
                eventGroup.on(element, 'click', parent.cb2);

                raiseEvent();

                expect(cb1Spy.called).to.be.true;
                expect(cb2Stub.called).to.be.false;
            });
        });
    });
});
