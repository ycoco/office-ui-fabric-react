
import EventGroup from './EventGroup';
import { ResourceKey, createDefaultTypeResourceKey } from '../resources/Resources';

export const typeResourceKey: ResourceKey<new (owner: any) => EventGroup> = createDefaultTypeResourceKey(require, EventGroup, {});
