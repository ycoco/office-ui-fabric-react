
import Component from '../../../odsp-utilities/component/Component';
import ResourceScope = require('../../../odsp-utilities/resources/ResourceScope');
import ResourceKey = require('../../../odsp-utilities/resources/ResourceKey');
import { expect } from 'chai';

class Example extends Component {
    public testManaged = this.managed;
    public testChild = this.child;
}

describe('Component', () => {
    let component: Example;
    let resources: ResourceScope;

    beforeEach(() => {
        resources = new ResourceScope();

        component = new (resources.injected(Example))();
    });

    describe('#resources', () => {
        it('matches input', () => {
            expect(component.resources).to.equal(resources);
        });
    });

    describe('#managed', () => {
        it('creates an instance in the same resource scope', () => {
            let managed = new (component.testManaged(Example))();

            expect(managed.resources).to.equal(resources);
        });
    });

    describe('#child', () => {
        it('creates an instance in a child resource scope', () => {
            let resourceKey = ResourceKey<string>('example');

            resources.expose(resourceKey, 'test');

            let child = new (component.testChild(Example))();

            expect(child.resources).not.to.equal(resources);

            expect(child.resources.consume(resourceKey)).to.equal('test');
        });
    });
});
