import IResourceKey = require("./IResourceKey");

class ResourceKey<T> implements IResourceKey<T> {
    private static _lastId: number = 0;

    public id: string;
    public name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    public static create<T>(name: string) {
        ResourceKey._lastId++;

        var id: string = ResourceKey._lastId.toString();

        return new ResourceKey<T>(id, name);
    }
}

const create: <T>(name: string) => IResourceKey<T> = ResourceKey.create;

export = create;
