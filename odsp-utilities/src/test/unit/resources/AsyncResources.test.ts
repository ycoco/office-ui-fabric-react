
import {
    ResourceKey,
    ResourceScope,
    ConstantResourceFactory
} from '../../../odsp-utilities/resources/Resources';
import {
    createDefaultAliasResourceKey
} from '../../../odsp-utilities/resources/AsyncResources';
import { expect } from 'chai';

describe('createDefaultAliasResourceKey', () => {
    let value: {};

    const keyName = 'key2';
    let key1: ResourceKey<{}>;
    let key2: typeof key1;

    let resources: ResourceScope;

    beforeEach(() => {
        value = {};

        resources = new ResourceScope({
            useFactoriesOnKeys: true
        });

        key1 = new ResourceKey<{}>({
            name: 'key1',
            factory: new ConstantResourceFactory(value)
        });

        key2 = createDefaultAliasResourceKey((paths: string[], onLoad: (result: { resourceKey: ResourceKey<{}>}) => void) => {
            if (paths as any === 'module') {
                return {
                    id: keyName
                };
            } else {
                onLoad({
                    resourceKey: key1
                });
            }
        }, 'key1');
    });

    it('sets the key name', () => {
        expect(key2.name).to.equal(keyName);
    });

    it('passes through value', () => {
        return resources.consumeAsync(key2).then((result: {}) => {
            expect(result).to.equal(value);
        });
    });
});
