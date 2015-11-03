/// <reference path="../../../../chai/chai.d.ts" />
/// <reference path="../../../../mocha/mocha.d.ts" />

import chai = require('chai');
var expect = chai.expect;

import ResourceScope = require("odsp-shared/utilities/resources/ResourceScope");
import ResourceKey = require("odsp-shared/utilities/resources/ResourceKey");

class ComponentA {
}

class ComponentB {
    constructor(a: ComponentA) {
        // Do nothing.
    }
}

class ExampleResourceKeys {
    static a = ResourceKey<ComponentA>('a');
    static b = ResourceKey<ComponentB>('b');
    static c = ResourceKey<ComponentA>('c');
}

describe("ResourceScope", () => {
    var rootScope: ResourceScope;
    var childScope: ResourceScope;

    beforeEach(() => {
        rootScope = new ResourceScope();
        childScope = new ResourceScope(rootScope);
    });

    describe("#expose", () => {
        it("provides only instance", () => {
            var rootInstance: ComponentA = new ComponentA();

            rootScope.expose(ExampleResourceKeys.a, rootInstance);

            var actualComponentA = rootScope.consume(ExampleResourceKeys.a);

            expect(actualComponentA).to.equal(rootInstance);

            actualComponentA = rootScope.consume(ExampleResourceKeys.a);

            expect(actualComponentA).to.equal(rootInstance);
        });
    });

    describe("#consume", () => {
        it("throws an error when consumed resource is not exposed", () => {
            expect(() => { rootScope.consume(ExampleResourceKeys.b); }).throws(ExampleResourceKeys.b.id);
        });

        it("gets instance from parent", () => {
            var rootInstance: ComponentA = new ComponentA();

            rootScope.expose(ExampleResourceKeys.a, rootInstance);

            expect(childScope.consume(ExampleResourceKeys.a)).to.equal(rootInstance);
        });

        it("gets from local override instance", () => {
            var rootInstance: ComponentA = new ComponentA();
            var childInstance: ComponentA = new ComponentA();

            rootScope.expose(ExampleResourceKeys.a, rootInstance);
            childScope.expose(ExampleResourceKeys.a, childInstance);

            expect(childScope.consume(ExampleResourceKeys.a)).to.equal(childInstance);
        });
    });

    describe("#isExposed", () => {
        it("returns false when a requested resource is not exposed", () => {
            expect(rootScope.isExposed(ExampleResourceKeys.a)).to.equal(false);
        });

        it("returns true  when a requested esource is exposed in parent", () => {
            let rootInstance: ComponentA = new ComponentA();
            rootScope.expose(ExampleResourceKeys.a, rootInstance);
            expect(childScope.isExposed(ExampleResourceKeys.a)).to.equal(true);
        });
    });

    describe("#dispose", () => {
        it("does not dispose existing instances", () => {
            var rootInstance: ComponentA = new ComponentA();
            var disposeCount = 0;

            rootInstance["dispose"] = () => {
                disposeCount++;
            };

            rootScope.expose(ExampleResourceKeys.a, rootInstance);

            rootScope.dispose();

            expect(disposeCount).to.equal(0);
        });

        it("does not dispose parent instances", () => {
            var rootInstance: ComponentA = new ComponentA();
            var disposeCount = 0;

            rootInstance["dispose"] = () => {
                disposeCount++;
            };

            rootScope.expose(ExampleResourceKeys.a, rootInstance);

            childScope.consume(ExampleResourceKeys.a);

            childScope.dispose();

            expect(disposeCount).to.equal(0);
        });
    });

    describe('#injected', () => {
        it('constructs object correctly', () => {
            var b = new (rootScope.injected(ComponentB))(new ComponentA());

            expect(b).to.be.an.instanceOf(ComponentB);
        });
    });
});
