
# Resources

The `Resources` module facilitates implementation and maintenance of a strongly-decoupled component architecture within a web application.

## Background

A typical architecture for an application will include 'simple' component implementations which accept some input parameters, and then utilize some number of 'child' components for purposes of separation-of-concerns and code reusability:

```ts
export class ItemProvider {
    constructor(params: {}) {
        this._itemStore = new ItemStore();
        this._itemDataSource = new ItemDataSource();
    }

    public getItem(key: string): Promise<IItem> {
        this._itemDataSource.loadItem(key).then(() => {
            return this._itemStore.getItem(key);
        });
    }
}
```

Here, the implementation of `ItemProvider` is certainly simple. It directly constructs the sub-components which it needs to complete its function.

One problem with this approach is that inevitably, the architecture will require that the `ItemProvider` share the `ItemStore` and `ItemDataSource` that it uses with other components.

Another problem is that of unit-testing. Any unit test which invokes `getItem` will trigger an AJAX call deep within the implementation of `ItemDataSource`.
Similarly, the `loadItem` call will likely complete asynchronously, requiring that the unit test carefully wait for the result `Promise` before validating the output.
The tests become coupled to the network call stack, the server data, and asynchronous state in the store and the data source.

In order to avoid some of these pitfalls, it becomes tempting to redesign `ItemProvider` in the following manner:

```ts
export class ItemProvider {
    constructor(params: {}) {
        this._itemStore = ItemStore.getInstance();
        this._itemDataSource = ItemDataSource.getInstance();
    }
    ...
}
```

Here, `ItemStore` and `ItemDataSource` are no longer constructed directly, but instead are obtained from singleton factories. The singleton factories ensure the re-use of the components.
For unit testing, `ItemStore.getInstance` can be replaced with a mock implementation, as can `ItemDataSource.getInstance`. The constructor for `ItemProvider` remains 'simple'.

Although it may seem 'better' than the first architecture, this design suffers from temporal coupling, both in the runtime of the application as well as unit-testing.
When overriding `ItemStore.getInstance` and `ItemDataSource.getInstance`, unit test code must be sure to reset the fields after each test.
Similarly, since the ability to override `ItemDataSource.getInstance` exists *at all*, there is a risk that production code for a derived application may override it in order to achieve a scenario-specific result.
The issue is that asynchronously-loaded modules which perform such overrides will execute in arbitrary order, making it difficult to control the ordering of overrides and to ensure that the desired overall behavior is maintained as the application is refactored over time.

To avoid many of these above problems, `ItemProvider` can be redesigned to look like the following:

```ts
export class ItemProvider {
    constructor(params: {}, dependencies: {
        itemStore: ItemStore;
        itemDataSource: ItemDataSource;
    }) {
        this._itemStore = dependencies.itemStore;
        this._itemDataSource = dependencies.itemDataSource;
    }
    ...
}
```

Here, `ItemProvider` now consumes instances of `ItemStore` and `ItemDataSource` in its constructor. `ItemProvider` is no longer responsible for choosing the implementations or lifetimes of these components.
Unit test code will simply pass mock implementations of each component where production code is expected to pass real implementations.

This comes at the cost of increased complexity of construction, however. In order to create an `ItemProvider`, an application must first construct instances of each of its dependencies:

```ts
const itemStore = new ItemStore();

const itemDataSource = new ItemDataSource({}, {
    itemStore: itemStore
});

const itemProvider = new ItemProvider({}, {
    itemStore: itemStore,
    itemDataSource: itemDataSource
});

itemProvider.getItem('test').done((item: IItem) => {
    console.log(item.name);
});
```

Since each implementation of a dependency may have its own dependencies, it quickly becomes unmanageable to construct the dependencies required for a target component.
In addition, performance requirements of the application may mandate that dependencies not be constructed until they are finally needed.

## Resource Scope

The `ResourceScope` component provides a way to manage a large system with many components, dependencies, and factories.

For each component with dependencies, declare a `ResourceKey` instance which specifies the factory necessary to construct the component.
For classes which consume `dependencies` as their second constructor argument, pass an object which maps each dependency to an appropriate `ResourceKey`:

```ts
const itemStoreKey: ResourceKey<IItemStore> = new ResourceKey({
    name: 'itemStore',
    factory: new SimpleResourceFactory(ItemStore)
});

const itemDataSourceKey: ResourceKey<IItemDataSource> = new ResourceKey({
    name: 'itemDataSource',
    factory: new ResolvedResourceFactory(ItemDataSource, {
        itemStore: itemStoreKey
    })
});

const itemProviderKey: ResourceKey<IItemProvider> = new ResourceKey({
    name: 'itemProvider',
    factory: new ResolvedResourceFactory(ItemProvider, {
        itemStore: itemStoreKey,
        itemDataSource: itemDataSourceKey
    })
});
```

With these `ResourceKey` instances available, create a a `ResourceScope` with `useFactoriesOnKeys: true`.
Then obtain an instance of a fully-operable component by using `consume` with the associated `ResourceKey` for that component:

```ts
const resources = new ResourceScope({
    owner: require('module').id,
    useFactoriesOnKeys: true
});

const itemProvider = resources.consume(itemProviderKey);

itemProvider.getItem('test').done((item: IItem) => {
    console.log(item.name);
});
```

Here, `ResourceScope` is able to provide any component for which a `ResourceKey` has been defined with an associated `factory`.
Each call to `consume` for a given key produces the same component instance, ensuring that components are maximally shared.
