
import Component, { IComponentParams, IComponentDependencies } from '../../../odsp-utilities/component/Component';
import { ConstantResourceFactory, IResourceDependencies, ResolvedResourceTypeFactory, ResourceScope, ResourceKey } from '../../../odsp-utilities/resources/Resources';
import { expect } from 'chai';

class Example extends Component {
    public testManaged = this.managed;
    public testChild = this.child;
}

interface IFooParams extends IComponentParams {
    a: number;
}

interface IFooDependencies extends IComponentDependencies {
    b: string;
}

const bKey = new ResourceKey({
    name: 'b',
    factory: new ConstantResourceFactory('something')
});

class Foo extends Component {
    public static readonly dependencies: IResourceDependencies<IFooDependencies> = {
        ...Component.dependencies,
        b: bKey
    };

    public a: number;
    public b: string;

    constructor(params: IFooParams, dependencies: IFooDependencies) {
        super(params, dependencies);

        this.a = params.a;
        this.b = dependencies.b;
    }
}

const fooTypeKey = new ResourceKey({
    name: 'fooType',
    factory: new ResolvedResourceTypeFactory(Foo)
});

describe('Component', () => {
    let component: Example;
    let resources: ResourceScope;

    beforeEach(() => {
        resources = new ResourceScope({
            useFactoriesOnKeys: true
        });

        component = new (resources.injected(Example))();
    });

    describe('#resources', () => {
        it('matches input', () => {
            expect(component.resources).to.equal(resources);
        });
    });

    describe('#managed', () => {
        it('creates an instance in the same resource scope', () => {
            const managed = new (component.testManaged(Example))();

            expect(managed.resources).to.equal(resources);
        });
    });

    describe('#child', () => {
        it('creates an instance in a child resource scope', () => {
            const resourceKey = new ResourceKey<string>('example');

            resources.expose(resourceKey, 'test');

            const child = new (component.testChild(Example))();

            expect(child.resources).not.to.equal(resources);

            expect(child.resources.consume(resourceKey)).to.equal('test');
        });

        it('works with resource keys', () => {
            const a: number = 5;
            const instance = new (component.testChild(fooTypeKey))({
                a: a
            });

            expect(instance).to.be.instanceof(Foo);
            expect(instance.a).to.equal(a);
            expect(instance.b).to.equal('something');
        });
    });

    describe('when constructed with dependencies', () => {
        let foo: Foo;

        beforeEach(() => {
            foo = new (resources.consume(fooTypeKey))({
                a: 3
            });
        });

        it('has a child resource scope', () => {
            expect(foo.resources).not.to.equal(resources);
        });
    });
});
