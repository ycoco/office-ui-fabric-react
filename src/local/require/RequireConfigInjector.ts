// OneDrive:IgnoreCodeCoverage

/** Provides utilities for adding require.js configuration. */
export default class RequireConfigInjector {
    /**
     * Merge the given configuration with the current configuration.
     * Merging might or might not occur intelligently, so use at your own risk.
     * See http://requirejs.org/docs/api.html#config
     */
    static addConfig(config: any) {
        requirejs.config(config);
    }

    /**
     * Add the given module name/path pairs to the current configuration.
     * For module names that already exist in the config, the new path overwrites the existing one.
     * (Module is used loosely--require can be used to load things that are not modules.)
     */
    static addPaths(paths: { [name: string]: string; }) {
        requirejs.config({
            paths: paths
        });
    }

    /**
     * Add the given shim information to the current configuration.
     */
    static addShims(shims: { [name: string]: { [property: string]: any }}) {
        requirejs.config({
            shim: shims
        });
    }
}