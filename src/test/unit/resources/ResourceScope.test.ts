
import { ResourceScope, ResourceKey } from '../../../odsp-utilities/resources/Resources';
import { expect } from 'chai';

module ExampleResourceKeys {
    export const a = new ResourceKey<ComponentA>('a');
    export const b = new ResourceKey<ComponentB>('b');
    export const c = new ResourceKey<ComponentA>('c');
}

class ComponentA {
    public resources: ResourceScope;
}

class ComponentB {
    public resources: ResourceScope;

    public c: ComponentA;

    constructor(a: ComponentA) {
        // Do nothing.

        this.c = this.resources.consume(ExampleResourceKeys.c);
    }
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
        let c: ComponentA;
        let b: ComponentB;

        beforeEach(() => {
            c = new ComponentA();

            rootScope.expose(ExampleResourceKeys.c, c);
        });

        describe('debug', () => {
            beforeEach(() => {
                b = new (rootScope.injected(ComponentB))(new ComponentA());
            });

            it('constructs object correctly', () => {
                expect(b).to.be.an.instanceOf(ComponentB);
            });

            it('injects itself as resources', () => {
                expect(b.resources).to.equal(rootScope);
            });

            it('can assign properties from resources', () => {
                expect(b.c).to.equal(c);
            });
        });
    });
});
