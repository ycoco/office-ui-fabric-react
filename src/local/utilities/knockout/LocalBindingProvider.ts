import ko = require("knockout");
import IKnockoutBindings = require("./IKnockoutBindings");
import IKnockoutBindingHandlers = require("./IKnockoutBindingHandlers");

/**
 * Binding provider which wraps Knockout's default provider to remap the binding keys to
 * bindings provider by the current view model.
 */
class LocalBindingProvider implements KnockoutBindingProvider {
    /**
     * The singleton instance
     */
    private static _instance: LocalBindingProvider = new LocalBindingProvider();

    private static _BINDING_PROVIDER_UNIQUE_KEY: string = "__localBindingProvider__uniqueKey";
    private static _lastUniqueKeyOrdinal: number = 0;

    private _bindingContexts: KnockoutBindingContext[];

    /**
     * The underlying Knockout binding provider.
     */
    private _originalProvider = new ko.bindingProvider();

    /**
     * A mapping of all binding handlers declared by view models to globally-unique keys.
     */
    private _bindingHandlers: IKnockoutBindingHandlers = {};

    constructor() {
        this._bindingContexts = [];
    }

    public static getInstance(): LocalBindingProvider {
        return LocalBindingProvider._instance;
    }

    /**
     * @inheritdoc
     */
    public nodeHasBindings(node: Node): boolean {
        return this._originalProvider.nodeHasBindings(node);
    }

    /**
     * @inheritdoc
     */
    public getBindings(node: Node, bindingContext: KnockoutBindingContext): { [key: string]: string } {
        try {
            this._bindingContexts.push(bindingContext);

            var bindings = <IKnockoutBindings>this._originalProvider.getBindings(node, bindingContext);

            return bindings && this._remapKeys(bindings, bindingContext);
        } finally {
            this._bindingContexts.pop();
        }
    }

    /**
     * @inheritdoc
     */
    public getBindingAccessors(node: Node, bindingContext: KnockoutBindingContext): { [key: string]: string } {
        try {
            this._bindingContexts.push(bindingContext);

            var bindingAccessors = this._originalProvider.getBindingAccessors(node, bindingContext);

            return bindingAccessors && this._remapKeys(bindingAccessors, bindingContext);
        } finally {
            this._bindingContexts.pop();
        }
    }

    /**
     * Gets a binding handler with the given global key.
     *
     * @param key a globally unique binding key used by Knockout.
     */
    public getBindingHandler(key: string): KnockoutBindingHandler {
        var bindingContext = this._bindingContexts.slice(-1)[0];

        if (bindingContext) {
            var localBindingHandlers = this._getLocalBindingHandlers(bindingContext);

            if (localBindingHandlers) {
                var localBindingHandler = localBindingHandlers[key];

                key = localBindingHandler && this.getUniqueKeyForBindingHandler(localBindingHandler, key) || key;
            }
        }

        return this._bindingHandlers[key] || ko.bindingHandlers[key];
    }

    /**
     * Generates and attaches a unique, global binding key to a binding handler.
     *
     * @param bindingHandler a binding handler instance.
     * @param the key used by the local binding handler mapping, to provide a friendly identifier.
     */
    public getUniqueKeyForBindingHandler(bindingHandler: KnockoutBindingHandler, suggestedKey: string): string {
        var uniqueKeyField = LocalBindingProvider._BINDING_PROVIDER_UNIQUE_KEY;

        // Assign a unique key to the binding handler instance so it can be found via a call through getBindingHandler() with the given key.
        var uniqueKey =
            bindingHandler[uniqueKeyField] =
            bindingHandler[uniqueKeyField] ||
            (suggestedKey + "-local-" + (++LocalBindingProvider._lastUniqueKeyOrdinal));

        // Insert a "clean" copy of the binding handler into the mappings with the
        // methods appropriately bound.
        this._bindingHandlers[uniqueKey] = {
            init: bindingHandler.init && bindingHandler.init.bind(bindingHandler),
            update: bindingHandler.update && bindingHandler.update.bind(bindingHandler),
            options: bindingHandler.options,
            preprocess: bindingHandler.preprocess && bindingHandler.preprocess.bind(bindingHandler)
        };

        // Gets around the TypeScript strict object literal assignment checking
        this._bindingHandlers[uniqueKey]['after'] = bindingHandler['after'];

        if (bindingHandler['supportsVirtualElements']) {
            ko.virtualElements.allowedBindings[uniqueKey] = true;
        }

        return uniqueKey;
    }

    /**
     * Remaps the keys used by a binding declaration with global keys for any bindings exposed locally.
     *
     * @param bindings the original bindings for an element.
     * @param bindingContext the binding context for the element, from which to extract the view model.
     */
    private _remapKeys(bindings: IKnockoutBindings, bindingContext: KnockoutBindingContext): IKnockoutBindings {
        var newBindings: IKnockoutBindings = bindings;

        var localBindingHandlers = this._getLocalBindingHandlers(bindingContext);

        if (localBindingHandlers) {
            newBindings = {};

            for (var key in bindings) {
                var localBindingHandler = localBindingHandlers[key];

                var newKey = localBindingHandler && this.getUniqueKeyForBindingHandler(localBindingHandler, key) || key;

                newBindings[newKey] = bindings[key];
            }
        }

        return newBindings;
    }

    /**
     * Gets the local declaration of binding handlers for the closest applicable view model.
     *
     * @param bindingContext the current Knockout binding context.
     */
    private _getLocalBindingHandlers(bindingContext: KnockoutBindingContext): KnockoutBindingHandlers {
        var bindingHandlers;

        // Iterate up the binding hierarchy, looking for the first view model with a "bindingHandlers" property.
        // Use this collection whether or not it has the desired key.
        while (!(bindingHandlers = (typeof bindingContext.$data === "object") && bindingContext.$data["bindingHandlers"]) && bindingContext.$parentContext) {
            bindingContext = bindingContext.$parentContext;
        }

        return bindingHandlers;
    }
}

var localBindingProvider = LocalBindingProvider.getInstance();

ko.getBindingHandler = localBindingProvider.getBindingHandler.bind(localBindingProvider);

ko.bindingProvider.instance = localBindingProvider;

export = LocalBindingProvider;
