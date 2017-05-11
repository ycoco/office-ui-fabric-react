
import {
    ResourceScope,
    ResourceKey,
    IResourceDependencies,
    IResourceFactory,
    ResolvedResourceFactory,
    ResolvedResourceLoader,
    SimpleResourceFactory,
    ConstantResourceFactory,
    asyncLoadBarrierKey,
    resourceScopeKey
} from '../../../odsp-utilities/resources/Resources';
import Promise from '../../../odsp-utilities/async/Promise';
import Signal from '../../../odsp-utilities/async/Signal';
import * as sinon from 'sinon';
import { expect } from 'chai';

namespace ExampleResourceKeys {
    export const a = new ResourceKey<ComponentA>('a');
    export const b = new ResourceKey<ComponentB>('b');
    export const c = new ResourceKey<ComponentA>('c');

    export const ra = new ResourceKey<ResolvableA>('ResolvableA');
    export const rb = new ResourceKey<ResolvableB>('ResolvableB');
    export const rc = new ResourceKey<ResolvableC>('ResolvableC');
    export const rd = new ResourceKey<ResolvableD>('ResolvableD');
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

class ResolvableA {
    public static readonly dependencies = {};

    protected __aBrand: 'a';
}

interface IBDependencies {
    readonly a: ResolvableA;
}

class ResolvableB {
    public static readonly dependencies: IResourceDependencies<IBDependencies> = {
        a: ExampleResourceKeys.ra.optional
    };

    public a: ResolvableA;

    protected __bBrand: 'b';

    constructor(params: {}, dependencies: IBDependencies) {
        this.a = dependencies.a;
    }
}

interface ICDependencies {
    readonly d: ResolvableD;
}

class ResolvableC {
    public static readonly dependencies: IResourceDependencies<ICDependencies> = {
        d: ExampleResourceKeys.rd.optional
    };

    public d: ResolvableD;

    protected __cBrand: 'c';

    constructor(params: {}, dependencies: ICDependencies) {
        this.d = dependencies.d;
    }
}

class ResolvableD {
    public static readonly dependencies: IResourceDependencies<IBDependencies> = {
        a: ExampleResourceKeys.ra
    };

    public a: ResolvableA;

    protected __dBrand: 'd';

    constructor(params: {}, dependencies: IBDependencies) {
        this.a = dependencies.a;
    }
}

interface IEDependencies {
    resources: ResourceScope;
}

class ResolvableE {
    public static readonly dependencies: IResourceDependencies<IEDependencies> = {
        resources: resourceScopeKey
    };

    public resources: ResourceScope;

    protected __eBrand: 'e';

    constructor(params: {}, dependencies: IEDependencies) {
        this.resources = dependencies.resources;
    }
}

const eKey = new ResourceKey({
    name: 'e',
    factory: new ResolvedResourceFactory(ResolvableE)
});

interface IFDependencies {
    e: ResolvableE;
}

class ResolvableF {
    public static readonly dependencies: IResourceDependencies<IFDependencies> = {
        e: eKey
    };

    public e: ResolvableE;

    protected __fBrand: 'f';

    constructor(params: {}, dependencies: IFDependencies) {
        this.e = dependencies.e;
    }
}

const fKey = new ResourceKey({
    name: 'f',
    factory: new ResolvedResourceFactory(ResolvableF)
});

const aFactory = new ResolvedResourceFactory(ResolvableA);
const aLoader = new ResolvedResourceLoader(() => Promise.wrap(ResolvableA));

const bLoader = new ResolvedResourceLoader(() => Promise.wrap(ResolvableB));

const cFactory = new ResolvedResourceFactory(ResolvableC);
const cLoader = new ResolvedResourceLoader(() => Promise.wrap(ResolvableC));

const dFactory = new ResolvedResourceFactory(ResolvableD);
const dLoader = new ResolvedResourceLoader(() => Promise.wrap(ResolvableD));

const circularFactory: IResourceFactory<ResolvableA, { b: ResolvableB }, IResourceDependencies<{ b: ResolvableB; }>> = {
    dependencies: {
        b: ExampleResourceKeys.rb
    },
    create: () => {
        return { instance: new ResolvableA() };
    }
};

const keyWithFactory = new ResourceKey({ name: 'keyWithFactory', factory: aFactory });

describe("ResourceScope", () => {
    describe("DoubleExpose", () => {
        let rootScope: ResourceScope;

        beforeEach(() => {
            rootScope = new ResourceScope({
                noDoubleExpose: true
            });
        });

        describe("#expose", () => {
            it("throws an error when double exposing a resource", () => {
                const rootInstance: ComponentA = new ComponentA();
                rootScope.expose(ExampleResourceKeys.a, rootInstance);
                expect(() => { rootScope.expose(ExampleResourceKeys.a, rootInstance); }).throws('' + ExampleResourceKeys.a.id);
            });
        });
    });

    describe("Locked", () => {
        let rootScope: ResourceScope;

        beforeEach(() => {
            rootScope = new ResourceScope({
                lockResourcesForChildren: true,
                useFactoriesOnKeys: true
            });
        });

        describe("#expose", () => {
            it("provides only instance", () => {
                const rootInstance: ComponentA = new ComponentA();
                rootScope.expose(ExampleResourceKeys.a, rootInstance);

                expect(rootScope.consume(ExampleResourceKeys.a)).to.equal(rootInstance);
                expect(rootScope.consume(ExampleResourceKeys.a)).to.equal(rootInstance);
            });
        });

        describe("#consume", () => {
            it("throws an error when consumed resource is not exposed", () => {
                expect(() => { rootScope.consume(ExampleResourceKeys.b); }).throws('' + ExampleResourceKeys.b.id);
            });

            it("throws an error when consumed resource is not loaded", () => {
                rootScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                expect(() => { rootScope.consume(ExampleResourceKeys.ra); }).throws('' + ExampleResourceKeys.ra.id);
            });

            it("throws an error when consumed resource is missing a dependency", () => {
                rootScope.exposeFactory(ExampleResourceKeys.rd, dFactory);
                expect(() => { rootScope.consume(ExampleResourceKeys.rd); }).throws('' + ExampleResourceKeys.ra.id);
            });

            it("works with a factory on a key", () => {
                const rootInstance = rootScope.consume(keyWithFactory);
                expect(rootInstance).to.be.an.instanceof(ResolvableA);
            });

            it("gets instance from parent", () => {
                const rootInstance: ComponentA = new ComponentA();
                rootScope.expose(ExampleResourceKeys.a, rootInstance);

                const childScope = new ResourceScope(rootScope);
                expect(childScope.consume(ExampleResourceKeys.a)).to.equal(rootInstance);
            });

            it("does not get instances that were exposed on the parent after the child was created", () => {
                const instance: ComponentA = new ComponentA();
                const childScope = new ResourceScope(rootScope);
                rootScope.expose(ExampleResourceKeys.a, instance);
                expect(() => { childScope.consume(ExampleResourceKeys.a); }).throws('' + ExampleResourceKeys.a.id);
            });

            it("gets from local override instance", () => {
                const rootInstance: ComponentA = new ComponentA();
                rootScope.expose(ExampleResourceKeys.a, rootInstance);

                const childScope = new ResourceScope(rootScope);
                const childInstance: ComponentA = new ComponentA();
                childScope.expose(ExampleResourceKeys.a, childInstance);

                expect(childScope.consume(ExampleResourceKeys.a)).to.equal(childInstance);
            });

            it("is not affected by the results of parent consume calls", () => {
                const rootInstance: ComponentA = new ComponentA();
                rootScope.expose(ExampleResourceKeys.a, rootInstance);

                const childScope = new ResourceScope(rootScope);
                const childInstance: ComponentA = new ComponentA();
                childScope.expose(ExampleResourceKeys.a, childInstance);

                expect(rootScope.consume(ExampleResourceKeys.a)).to.equal(rootInstance);
                expect(childScope.consume(ExampleResourceKeys.a)).to.equal(childInstance);
            });

            it("is not affected by the results of child consume calls", () => {
                const rootInstance: ComponentA = new ComponentA();
                rootScope.expose(ExampleResourceKeys.a, rootInstance);

                const childScope = new ResourceScope(rootScope);
                const childInstance: ComponentA = new ComponentA();
                childScope.expose(ExampleResourceKeys.a, childInstance);

                expect(childScope.consume(ExampleResourceKeys.a)).to.equal(childInstance);
                expect(rootScope.consume(ExampleResourceKeys.a)).to.equal(rootInstance);
            });

            it("constructs an object with no dependencies", () => {
                rootScope.exposeFactory(ExampleResourceKeys.ra, aFactory);
                expect(rootScope.consume(ExampleResourceKeys.ra)).to.be.an.instanceof(ResolvableA);
            });

            it("returns the same constructed instance in a child scope", () => {
                rootScope.exposeFactory(ExampleResourceKeys.ra, aFactory);
                const childScope = new ResourceScope(rootScope);
                const rootInstance = rootScope.consume(ExampleResourceKeys.ra);
                expect(childScope.consume(ExampleResourceKeys.ra)).to.equal(rootInstance);
            });

            it("constructs an instance with a dependency", () => {
                rootScope.exposeFactory(ExampleResourceKeys.ra, aFactory);
                rootScope.exposeFactory(ExampleResourceKeys.rd, dFactory);

                const instance = rootScope.consume(ExampleResourceKeys.rd);
                expect(instance).to.be.an.instanceof(ResolvableD);
                expect(instance.a).to.be.an.instanceof(ResolvableA);
            });

            it("returns an error for a missing dependency if it is exposed in a child scope", () => {
                rootScope.exposeFactory(ExampleResourceKeys.rd, dFactory);
                const childScope = new ResourceScope(rootScope);
                childScope.exposeFactory(ExampleResourceKeys.ra, aFactory);

                expect(() => { rootScope.consume(ExampleResourceKeys.rd); }).throws('' + ExampleResourceKeys.ra.id);
            });

            it("allows alternating with expose calls on the same scope", () => {
                rootScope.exposeFactory(ExampleResourceKeys.ra, aFactory);
                expect(rootScope.consume(ExampleResourceKeys.ra)).to.be.an.instanceof(ResolvableA);
                rootScope.exposeFactory(ExampleResourceKeys.rd, dFactory);
                expect(rootScope.consume(ExampleResourceKeys.rd)).to.be.an.instanceof(ResolvableD);
            });

            it("handles keys that depend on the ResourceScope key", () => {
                const result = rootScope.consume(eKey);
                expect(result).to.be.an.instanceof(ResolvableE);
                expect(result.resources).to.be.an.instanceof(ResourceScope);
            });

            it("handles dependencies that depend on the ResourceScope key", () => {
                const result = rootScope.consume(fKey);
                expect(result).to.be.an.instanceof(ResolvableF);
                expect(result.e).to.be.an.instanceof(ResolvableE);
                expect(result.e.resources).to.be.an.instanceof(ResourceScope);
            });

            it("resolves the ResourceScope key where the object was constructed", () => {
                const childScope = new ResourceScope(rootScope);
                childScope.exposeFactory(ExampleResourceKeys.ra, aFactory);
                const result = childScope.consume(eKey);
                expect(result).to.be.an.instanceof(ResolvableE);
                expect(result.resources).to.be.an.instanceof(ResourceScope);
                expect(result.resources.isExposed(ExampleResourceKeys.ra)).to.equal(false);
            });
        });

        describe("#isExposed", () => {
            it("returns false when a requested resource is not exposed", () => {
                expect(rootScope.isExposed(ExampleResourceKeys.a)).to.equal(false);
            });

            it("returns false for the resource scope key", () => {
                expect(rootScope.isExposed(resourceScopeKey)).to.equal(false);
            });

            it("returns true  when a requested resource is exposed in parent", () => {
                const rootInstance: ComponentA = new ComponentA();
                rootScope.expose(ExampleResourceKeys.a, rootInstance);
                const childScope = new ResourceScope(rootScope);
                expect(childScope.isExposed(ExampleResourceKeys.a)).to.equal(true);
            });

            it("returns true for a key that has a factory", () => {
                expect(rootScope.isExposed(keyWithFactory)).to.equal(true);
            });

            it("returns false when a requested resource is exposed only in a child", () => {
                const childScope = new ResourceScope(rootScope);
                childScope.exposeFactory(ExampleResourceKeys.ra, aFactory);
                expect(rootScope.isExposed(ExampleResourceKeys.ra)).to.equal(false);
            });

            it("returns true when a resource has been exposed as a factory", () => {
                rootScope.exposeFactory(ExampleResourceKeys.ra, aFactory);
                expect(rootScope.isExposed(ExampleResourceKeys.ra)).to.equal(true);
            });

            it("returns false when a requested resource has only been exposed asynchronously and not loaded", () => {
                rootScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                expect(rootScope.isExposed(ExampleResourceKeys.ra)).to.equal(false);
            });

            it("returns true when an object has been loaded via a child", () => {
                rootScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                const childScope = new ResourceScope(rootScope);
                return childScope.load({ a: ExampleResourceKeys.ra }).then(() => {
                    expect(rootScope.isExposed(ExampleResourceKeys.ra)).to.equal(true);
                });
            });

            it("returns false when a requested resource has an unloaded dependency", () => {
                rootScope.exposeFactory(ExampleResourceKeys.rd, dFactory);
                const childScope = new ResourceScope(rootScope);
                childScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                expect(childScope.isExposed(ExampleResourceKeys.rd)).to.equal(false);
            });

            it("returns false when a resource has been blocked", () => {
                rootScope.exposeFactory(ExampleResourceKeys.ra, aFactory);
                const childScope = new ResourceScope(rootScope);
                childScope.block(ExampleResourceKeys.ra);
                expect(childScope.isExposed(ExampleResourceKeys.ra)).to.equal(false);
            });
        });

        describe("#isDefined", () => {
            const key = new ResourceKey<{}>('test');
            const keyWithLoader = new ResourceKey({
                name: 'test',
                loader: {
                    load() { return Promise.wrap(new ConstantResourceFactory({})); }
                }
            });

            it('returns false when a resource has never been exposed', () => {
                expect(rootScope.isDefined(key)).to.be.false;
            });

            it('returns true when the resource has been exposed async', () => {
                rootScope.exposeAsync(key, keyWithLoader.loader);

                expect(rootScope.isDefined(key)).to.be.true;
            });

            it('returns true if the resource has a loader', () => {
                expect(rootScope.isDefined(keyWithLoader)).to.be.true;
            });
        });

        describe("#bind", () => {
            it("causes a new instance to be created for a child scope", () => {
                rootScope.exposeFactory(ExampleResourceKeys.ra, aFactory);
                const childScope = new ResourceScope(rootScope);
                childScope.bind(ExampleResourceKeys.ra);
                const rootInstance = rootScope.consume(ExampleResourceKeys.ra);
                const childInstance = childScope.consume(ExampleResourceKeys.ra);
                expect(rootInstance).to.be.an.instanceof(ResolvableA);
                expect(childInstance).to.be.an.instanceof(ResolvableA);
                expect(rootInstance).to.not.equal(childInstance);
            });
        });

        describe("#consumeAsync", () => {
            it("produces an object successfully with no dependencies", () => {
                rootScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                return rootScope.consumeAsync(ExampleResourceKeys.ra).then((value: ResolvableA) => {
                    expect(value).to.be.an.instanceof(ResolvableA);
                });
            });

            it("returns a directly exposed object", () => {
                const c: ComponentA = new ComponentA();
                const childScope = new ResourceScope(rootScope);
                childScope.expose(ExampleResourceKeys.c, c);
                const b: ComponentB = new (childScope.injected(ComponentB))(new ComponentA());
                rootScope.expose(ExampleResourceKeys.b, b);
                return rootScope.consumeAsync(ExampleResourceKeys.b).then((value: ComponentB) => {
                    expect(value).to.equal(b);
                });
            });

            it("returns an error for a missing dependency", () => {
                rootScope.exposeAsync(ExampleResourceKeys.rd, dLoader);
                return rootScope.consumeAsync(ExampleResourceKeys.rd).then((value: ResolvableD) => {
                    expect(value).to.not.exist;
                }, (error: any) => {
                    expect(error.message).to.string('' + ExampleResourceKeys.ra.id);
                });
            });

            it("returns an error for a circular dependency", () => {
                rootScope.exposeFactory(ExampleResourceKeys.ra, circularFactory);
                rootScope.exposeAsync(ExampleResourceKeys.rb, bLoader);
                return rootScope.consumeAsync(ExampleResourceKeys.rb).then((value: ResolvableB) => {
                    expect(value).to.not.exist;
                }, (error: any) => {
                    expect(error.message).to.string('' + ExampleResourceKeys.rb.id);
                });
            });

            it("produces an object successfully with a dependency", () => {
                rootScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                rootScope.exposeAsync(ExampleResourceKeys.rd, dLoader);
                return rootScope.consumeAsync(ExampleResourceKeys.rd).then((value: ResolvableD) => {
                    expect(value).to.be.an.instanceof(ResolvableD);
                    expect(rootScope.consume(ExampleResourceKeys.ra)).to.equal(value.a);
                });
            });

            it("produces a new object if there is a new factory", () => {
                rootScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                const childScope = new ResourceScope(rootScope);
                childScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                return rootScope.consumeAsync(ExampleResourceKeys.ra).then((rootValue: ResolvableA) => {
                    return childScope.consumeAsync(ExampleResourceKeys.ra).then((childValue: ResolvableA) => {
                        expect(rootValue).to.not.equal(childValue);
                    });
                });
            });

            it("does not produce a new object if dependencies didn't change", () => {
                rootScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                rootScope.exposeAsync(ExampleResourceKeys.rd, dLoader);
                const childScope = new ResourceScope(rootScope);
                return rootScope.consumeAsync(ExampleResourceKeys.rd).then((rootValue: ResolvableD) => {
                    expect(rootValue).to.be.an.instanceof(ResolvableD);
                    childScope.exposeFactory(ExampleResourceKeys.rc, cFactory);
                    const childValue = childScope.consume(ExampleResourceKeys.rd);
                    expect(childValue).to.equal(rootValue);
                    return childScope.consumeAsync(ExampleResourceKeys.rd).then((childValue: ResolvableD) => {
                        expect(childValue).to.equal(rootValue);
                    });
                });
            });

            it("produces a new object if there is a new dependency", () => {
                rootScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                rootScope.exposeAsync(ExampleResourceKeys.rd, dLoader);
                const childScope = new ResourceScope(rootScope);
                childScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                return rootScope.consumeAsync(ExampleResourceKeys.rd).then((rootValue: ResolvableD) => {
                    return childScope.consumeAsync(ExampleResourceKeys.rd).then((childValue: ResolvableD) => {
                        expect(rootValue).to.not.equal(childValue);
                    });
                });
            });

            it("produces an object successfully when there is a missing optional dependency", () => {
                rootScope.exposeAsync(ExampleResourceKeys.rb, bLoader);
                return rootScope.consumeAsync(ExampleResourceKeys.rb).then((value: ResolvableB) => {
                    expect(value).to.be.an.instanceof(ResolvableB);
                    expect(value.a).to.not.exist;
                });
            });

            it("produces a new object when a new optional dependency is met", () => {
                rootScope.exposeAsync(ExampleResourceKeys.rb, bLoader);
                const childScope = new ResourceScope(rootScope);
                childScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                return rootScope.consumeAsync(ExampleResourceKeys.rb).then((rootValue: ResolvableB) => {
                    expect(rootValue).to.be.an.instanceof(ResolvableB);
                    expect(rootValue.a).to.not.exist;
                    return childScope.consumeAsync(ExampleResourceKeys.rb).then((childValue: ResolvableB) => {
                        expect(childValue).to.be.an.instanceof(ResolvableB);
                        expect(childValue.a).to.be.an.instanceof(ResolvableA);
                        expect(rootValue).to.not.equal(childValue);
                    });
                });
            });

            it("produces an object successfully when an optional dependency is missing a dependency", () => {
                rootScope.exposeAsync(ExampleResourceKeys.rd, dLoader);
                rootScope.exposeAsync(ExampleResourceKeys.rc, cLoader);
                return rootScope.consumeAsync(ExampleResourceKeys.rc).then((value: ResolvableC) => {
                    expect(value).to.be.an.instanceof(ResolvableC);
                    expect(value.d).to.not.exist;
                });
            });

            it("merges all subsequent loads for the same resource", () => {
                const signal = new Signal<typeof ResolvableA>();
                rootScope.exposeAsync(ExampleResourceKeys.ra, new ResolvedResourceLoader(() => signal.getPromise()));
                let result1: ResolvableA;
                let result2: ResolvableA;
                rootScope.consumeAsync(ExampleResourceKeys.ra).then((result: ResolvableA) => {
                    result1 = result;
                });
                rootScope.consumeAsync(ExampleResourceKeys.ra).then((result: ResolvableA) => {
                    result2 = result;
                });
                signal.complete(ResolvableA);
                expect(result1).to.exist;
                expect(result2).to.exist;
                expect(result1).to.equal(result2);
            });
        });

        describe("#dispose", () => {
            it("does not dispose existing instances", () => {
                const rootInstance: ComponentA = new ComponentA();
                var disposeCount = 0;

                rootInstance["dispose"] = () => {
                    disposeCount++;
                };

                rootScope.expose(ExampleResourceKeys.a, rootInstance);

                rootScope.dispose();

                expect(disposeCount).to.equal(0);
            });

            it("disposes constructed instances", () => {
                const stub = sinon.stub();
                const key = new ResourceKey({
                    name: 'foo',
                    factory: new SimpleResourceFactory(class {
                        public dispose = stub;
                    })
                });

                rootScope.consume(key);

                rootScope.dispose();

                expect(stub.called).to.equal(true);
            });

            it("does not dispose parent instances", () => {
                const rootInstance: ComponentA = new ComponentA();
                var disposeCount = 0;

                rootInstance["dispose"] = () => {
                    disposeCount++;
                };

                rootScope.expose(ExampleResourceKeys.a, rootInstance);
                const childScope = new ResourceScope(rootScope);

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

        describe('#resolved', () => {
            it('resolves the ResourceScope key where the object was instantiated', () => {
                const childScope = new ResourceScope(rootScope);
                childScope.exposeFactory(ExampleResourceKeys.ra, aFactory);
                const instance = new (childScope.resolved(ResolvableE))({});
                expect(instance).to.be.an.instanceof(ResolvableE);
                expect(instance.resources).to.be.an.instanceof(ResourceScope);
                expect(instance.resources).to.not.equal(rootScope);
                expect(instance.resources).to.not.equal(childScope);
                expect(instance.resources.isExposed(ExampleResourceKeys.ra)).to.equal(true);
            });
        });

        describe('#resolve', () => {
            let childScope: ResourceScope;

            beforeEach(() => {
                childScope = new ResourceScope(rootScope);
            });

            it('resolves a lazy dependency as a function', () => {
                const instance = childScope.resolve<{ value: () => ResolvableA }>({
                    value: keyWithFactory.lazy
                }).value;
                expect(typeof instance).to.equal('function');
                expect(instance()).to.be.instanceof(ResolvableA);
            });

            it('resolves a local dependency in the child scope', () => {
                const dependency = keyWithFactory.local;
                childScope.expose(ExampleResourceKeys.ra, undefined);
                const instance = childScope.resolve({
                    value: dependency
                }).value;
                const rootInstance = rootScope.resolve({
                    value: dependency
                }).value;
                expect(instance).to.be.instanceof(ResolvableA);
                expect(instance === rootInstance).to.equal(false);
            });
        });
    });

    describe("Unlocked", () => {
        let rootScope: ResourceScope;
        let childScope: ResourceScope;

        beforeEach(() => {
            rootScope = new ResourceScope();
            childScope = new ResourceScope(rootScope);
        });

        describe("#consume", () => {
            it("gets instance from parent", () => {
                const rootInstance: ComponentA = new ComponentA();

                rootScope.expose(ExampleResourceKeys.a, rootInstance);

                expect(childScope.consume(ExampleResourceKeys.a)).to.equal(rootInstance);
            });

            it("gets from local override instance", () => {
                const rootInstance: ComponentA = new ComponentA();
                const childInstance: ComponentA = new ComponentA();

                rootScope.expose(ExampleResourceKeys.a, rootInstance);
                childScope.expose(ExampleResourceKeys.a, childInstance);

                expect(childScope.consume(ExampleResourceKeys.a)).to.equal(childInstance);
            });

            it("is not affected by the results of parent consume calls", () => {
                const rootInstance: ComponentA = new ComponentA();
                const childInstance: ComponentA = new ComponentA();

                rootScope.expose(ExampleResourceKeys.a, rootInstance);
                childScope.expose(ExampleResourceKeys.a, childInstance);

                expect(rootScope.consume(ExampleResourceKeys.a)).to.equal(rootInstance);
                expect(childScope.consume(ExampleResourceKeys.a)).to.equal(childInstance);
            });

            it("is not affected by the results of child consume calls", () => {
                const rootInstance: ComponentA = new ComponentA();
                const childInstance: ComponentA = new ComponentA();

                rootScope.expose(ExampleResourceKeys.a, rootInstance);
                childScope.expose(ExampleResourceKeys.a, childInstance);

                expect(childScope.consume(ExampleResourceKeys.a)).to.equal(childInstance);
                expect(rootScope.consume(ExampleResourceKeys.a)).to.equal(rootInstance);
            });

            it("returns the same constructed instance in a child scope", () => {
                rootScope.exposeFactory(ExampleResourceKeys.ra, aFactory);
                const rootInstance = rootScope.consume(ExampleResourceKeys.ra);
                expect(childScope.consume(ExampleResourceKeys.ra)).to.equal(rootInstance);
            });

            it("returns an error for a missing dependency if it is exposed in a child scope", () => {
                rootScope.exposeFactory(ExampleResourceKeys.rd, dFactory);
                childScope.exposeFactory(ExampleResourceKeys.ra, aFactory);

                expect(() => { rootScope.consume(ExampleResourceKeys.rd); }).throws('' + ExampleResourceKeys.ra.id);
            });
        });

        describe("#isExposed", () => {
            it("returns true when a requested resource is exposed in parent", () => {
                const rootInstance: ComponentA = new ComponentA();
                rootScope.expose(ExampleResourceKeys.a, rootInstance);
                expect(childScope.isExposed(ExampleResourceKeys.a)).to.equal(true);
            });

            it("returns false when a requested resource is exposed only in a child", () => {
                childScope.exposeFactory(ExampleResourceKeys.ra, aFactory);
                expect(rootScope.isExposed(ExampleResourceKeys.ra)).to.equal(false);
            });

            it("returns true when an object has been loaded via a child", () => {
                rootScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                return childScope.load({ a: ExampleResourceKeys.ra }).then(() => {
                    expect(rootScope.isExposed(ExampleResourceKeys.ra)).to.equal(true);
                });
            });

            it("returns false when a requested resource has an unloaded dependency", () => {
                rootScope.exposeFactory(ExampleResourceKeys.rd, dFactory);
                childScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                expect(childScope.isExposed(ExampleResourceKeys.rd)).to.equal(false);
            });
        });

        describe("#consumeAsync", () => {
            it("returns a directly exposed object", () => {
                const c: ComponentA = new ComponentA();
                childScope.expose(ExampleResourceKeys.c, c);
                const b: ComponentB = new (childScope.injected(ComponentB))(new ComponentA());
                rootScope.expose(ExampleResourceKeys.b, b);
                return rootScope.consumeAsync(ExampleResourceKeys.b).then((value: ComponentB) => {
                    expect(value).to.equal(b);
                });
            });

            it("produces an object successfully with a dependency", () => {
                rootScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                rootScope.exposeAsync(ExampleResourceKeys.rd, dLoader);
                return rootScope.consumeAsync(ExampleResourceKeys.rd).then((value: ResolvableD) => {
                    expect(value).to.be.an.instanceof(ResolvableD);
                    expect(rootScope.consume(ExampleResourceKeys.ra)).to.equal(value.a);
                });
            });

            it("produces a new object if there is a new factory", () => {
                rootScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                const childScope = new ResourceScope(rootScope);
                childScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                return rootScope.consumeAsync(ExampleResourceKeys.ra).then((rootValue: ResolvableA) => {
                    return childScope.consumeAsync(ExampleResourceKeys.ra).then((childValue: ResolvableA) => {
                        expect(rootValue).to.not.equal(childValue);
                    });
                });
            });

            it("does not produce a new object if dependencies didn't change", () => {
                rootScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                rootScope.exposeAsync(ExampleResourceKeys.rd, dLoader);
                const childScope = new ResourceScope(rootScope);
                return rootScope.consumeAsync(ExampleResourceKeys.rd).then((rootValue: ResolvableD) => {
                    expect(rootValue).to.be.an.instanceof(ResolvableD);
                    childScope.exposeFactory(ExampleResourceKeys.rc, cFactory);
                    const childValue = childScope.consume(ExampleResourceKeys.rd);
                    expect(childValue).to.equal(rootValue);
                    return childScope.consumeAsync(ExampleResourceKeys.rd).then((childValue: ResolvableD) => {
                        expect(childValue).to.equal(rootValue);
                    });
                });
            });

            it("produces a new object if there is a new dependency", () => {
                rootScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                rootScope.exposeAsync(ExampleResourceKeys.rd, dLoader);
                const childScope = new ResourceScope(rootScope);
                childScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                return rootScope.consumeAsync(ExampleResourceKeys.rd).then((rootValue: ResolvableD) => {
                    return childScope.consumeAsync(ExampleResourceKeys.rd).then((childValue: ResolvableD) => {
                        expect(rootValue).to.not.equal(childValue);
                    });
                });
            });

            it("produces an object successfully when there is a missing optional dependency", () => {
                rootScope.exposeAsync(ExampleResourceKeys.rb, bLoader);
                return rootScope.consumeAsync(ExampleResourceKeys.rb).then((value: ResolvableB) => {
                    expect(value).to.be.an.instanceof(ResolvableB);
                    expect(value.a).to.not.exist;
                });
            });

            it("produces a new object when a new optional dependency is met", () => {
                rootScope.exposeAsync(ExampleResourceKeys.rb, bLoader);
                const childScope = new ResourceScope(rootScope);
                childScope.exposeAsync(ExampleResourceKeys.ra, aLoader);
                return rootScope.consumeAsync(ExampleResourceKeys.rb).then((rootValue: ResolvableB) => {
                    expect(rootValue).to.be.an.instanceof(ResolvableB);
                    expect(rootValue.a).to.not.exist;
                    return childScope.consumeAsync(ExampleResourceKeys.rb).then((childValue: ResolvableB) => {
                        expect(childValue).to.be.an.instanceof(ResolvableB);
                        expect(childValue.a).to.be.an.instanceof(ResolvableA);
                        expect(rootValue).to.not.equal(childValue);
                    });
                });
            });

            it("produces an object successfully when an optional dependency is missing a dependency", () => {
                rootScope.exposeAsync(ExampleResourceKeys.rd, dLoader);
                rootScope.exposeAsync(ExampleResourceKeys.rc, cLoader);
                return rootScope.consumeAsync(ExampleResourceKeys.rc).then((value: ResolvableC) => {
                    expect(value).to.be.an.instanceof(ResolvableC);
                    expect(value.d).to.not.exist;
                });
            });

            it("respects asyncLoadBarrierKey", () => {
                const signal = new Signal<void>();
                let waitInvoked: boolean = false;
                let isComplete: boolean = false;
                rootScope.expose(asyncLoadBarrierKey, {
                    wait() {
                        waitInvoked = true;
                        return signal.getPromise();
                    }
                });
                rootScope.exposeAsync(ExampleResourceKeys.ra, aLoader);

                const result = rootScope.consumeAsync(ExampleResourceKeys.ra).then((value: ResolvableA) => {
                    expect(value).to.be.an.instanceof(ResolvableA);
                    expect(isComplete).to.equal(true);
                    expect(waitInvoked).to.equal(true);
                });

                isComplete = true;
                signal.complete();

                return result;
            });
        });

        describe("#dispose", () => {
            it("does not dispose parent instances", () => {
                const rootInstance: ComponentA = new ComponentA();
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
    });

    describe("NewInjected", () => {
        let rootScope: ResourceScope;
        let c: ComponentA;
        let b: ComponentB;

        beforeEach(() => {
            c = new ComponentA();
            rootScope = new ResourceScope();
            rootScope.expose(ExampleResourceKeys.c, c);
        });

        describe('debug', () => {
            beforeEach(() => {
                b = new (rootScope.injected(ComponentB, {
                    injectChildResourceScope: true
                }))(new ComponentA());
            });

            it('constructs object correctly', () => {
                expect(b).to.be.an.instanceOf(ComponentB);
            });

            it('injects itself as resources', () => {
                expect(b.resources).to.not.equal(rootScope);
            });

            it('can assign properties from resources', () => {
                expect(b.c).to.equal(c);
            });
        });
    });
});
