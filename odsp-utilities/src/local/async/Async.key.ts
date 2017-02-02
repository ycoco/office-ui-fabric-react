
import Async from './Async';
import { ResourceKey, createDefaultTypeResourceKey } from '../resources/Resources';

export const typeResourceKey: ResourceKey<new (owner: any) => Async> = createDefaultTypeResourceKey(require, Async, {});
