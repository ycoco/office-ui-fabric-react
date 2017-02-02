
import ObservablesFactory, { IKnockoutFactoryParams } from './ObservablesFactory';
import { ResourceKey, createDefaultTypeResourceKey } from '@ms/odsp-utilities/lib/resources/Resources';
import { typeResourceKey as asyncTypeKey } from '@ms/odsp-utilities/lib/async/Async.key';

export const typeResourceKey: ResourceKey<new (params?: IKnockoutFactoryParams) => ObservablesFactory> = createDefaultTypeResourceKey(require, ObservablesFactory, {
    Async: asyncTypeKey
});
