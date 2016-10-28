
let lastId: number = 0;

export class ResourceKey<TResource> {
    /**
     * The id of the key, used for indexing.
     *
     * @memberOf ResourceKey
     */
    public readonly id: string;
    /**
     * The friendly name for this key, used for debugging.
     *
     * @memberOf ResourceKey
     */
    public readonly name: string;

    protected readonly _ResourceKeyBrand: TResource;

    /**
     * Creates an instance of ResourceKey.
     *
     * @param {string} name
     *
     * @memberOf ResourceKey
     */
    constructor(name: string) {
        this.id = `${++lastId}`;
        this.name = name;
    }
}

export default ResourceKey;
