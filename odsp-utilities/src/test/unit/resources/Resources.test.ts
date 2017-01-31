
import {
    ResourceKey,
    ResourceScope,
    AliasResourceFactory,
    ConstantResourceFactory
} from '../../../odsp-utilities/resources/Resources';
import { expect } from 'chai';

describe('AliasResourceFactory', () => {
    const key1 = new ResourceKey<{}>('key1');
    const key2 = new ResourceKey<{}>('key2');

    let value: {};

    let resources: ResourceScope;

    beforeEach(() => {
        value = {};

        resources = new ResourceScope({
            useFactoriesOnKeys: true
        });

        resources.exposeFactory(key1, new ConstantResourceFactory(value));
        resources.exposeFactory(key2, new AliasResourceFactory(key1));
    });

    it('passes through value', () => {
        expect(resources.consume(key2)).to.equal(value);
    });
});
