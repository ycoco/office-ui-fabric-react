
import { loadModuleExport, IRequire } from '../modules/Modules';
import { IAliasableDependency, AliasResourceLoader, ResourceKey } from './Resources';

export function getResourceKeyExport<TInstance>(module: {
    resourceKey: IAliasableDependency<TInstance>
}): IAliasableDependency<TInstance> {
    return module.resourceKey;
}

export function createDefaultAliasResourceKey<TInstance>(require: IRequire, path: string): ResourceKey<TInstance> {
    return new ResourceKey<TInstance>({
        name: (require as any)('module').id,
        loader: new AliasResourceLoader<TInstance>(() => loadModuleExport<{ resourceKey: IAliasableDependency<TInstance> }, IAliasableDependency<TInstance>>({
            require: require,
            path: path,
            getExport: getResourceKeyExport
        }))
    });
}