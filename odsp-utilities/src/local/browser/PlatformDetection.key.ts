// OneDrive:IgnoreCodeCoverage
import { ResourceKey, SimpleResourceFactory } from '../resources/Resources';
import PlatformDetection from './PlatformDetection';

export const platformDetection: ResourceKey<PlatformDetection> = new ResourceKey({
    name: 'platformDetection',
    factory: new SimpleResourceFactory(PlatformDetection)
});
