
# Engagement Module

This module assists in capturing context from components and user actions and firing "Engagement" events to the current logging system.

## Engagement Names

When an engagement event is fired, the final name consists of the pieces sorted first by type, and then by precedence.
A child engagement context always takes precedence over parent contexts of the same type.

The type order is:

1. Subject
1. Intent
1. Component
1. Event

Each major type is separated with a `'.'` character and each piece of the same type is separated with a `'/'` character.

As examples:

- `List/Folder.Upload.List/Spotlight/ItemTile.Drag`  
Content was dragged onto a spotlight tile rendering a folder from a list, which started an upload.
- `Drive/Photo.Rotate.OneUp/Command.Click`  
A photo in a Consumer drive was rotated by clicking a command in the OneUp view.

## Engagement Keys

The first thing to do is define some `EngagementPart` instances which specify event names and types that will be used in the application.
There does not need to be a key for every unique event fired; instead, the goal should be to define 'pieces' which, in combination, can be used
to reflect the various scenarios in the application.

Engagement keys may also specify that they require additional data to be provided when used: this data will be supplied to the event
and prefixed with the key name.

``` typescript
// Subject keys

export const file: EngagementPart<'File', {}> = new EngagementPart<'File', {}>('File', EngagementPartType.subject);
export const folder: EngagementPart<'Folder', {}> = new EngagementPart<'Folder', {}>('Folder', EngagementPartType.subject);

export interface IListData {
    id: string;
}

export const list: EngagementPart<'List', IListData> = new EngagementPart<'List', IListData>('List', EngagementPartType.subject);

// Intent keys

export const delete: EngagementPart<'Delete', {}> = new EngagementPart<'Delete', {}>('Delete', EnagementKey.intent);
export const move: EngagementPart<'Move', {}> = new EngagementPart<'Move', {}>('Move', EnagementKey.intent);

export interface IUploadData {
    fileExtension: string;
}

export const upload: EngagementPart<'Upload', IUploadData> = new EngagementPart<'Click', IUploadData>('Upload', EngagementPartType.intent);

// Component keys

export const itemTile: EngagementPart<'ItemTile', {}> = new EngagementPart<'ItemTile', {}>('ItemTile', EngagementPartType.component);
export const detailsRow: EngagementPart<'DetailsRow', {}> = new EngagementPart<'DetailsRow', {}>('DetailsRow', EngagementPartType.component);
export const command: EngagementPart<'Command', {}> = new EngagementPart<'Command', {}>('Command', EngagementPartType.component);

// Event keys

export interface IClickData {
    pointerType: string;
}

export const click: EngagementPart<'Click', IClickData> = new EngagementPart<'Click', IClickData>('Click', EngagementPartType.event);
```

An event name will ultimately consist of an ordered series of these keys, for example:

- `File.Upload.Command.Click`
- `Folder.Delete.Command.Click`
- `File.Open.ItemTile.Click`
- `File.Open.DetailsRow.Click`

## Engagement Helper

To fire `Engagement` events, create an instance of `EngagementHelper` in a component.
Use `prepare` and `fire` to indicate engagement with a particular event.

``` typescript
export class UploadAction {
    private _engagementHelper: EngagementHelper;

    constructor(params: {
        file: File;
    }, dependencies: {
        engagementSource?: IEngagementSource;
    }) {
        const {
            file
        } = params;

        const {
            engagementSource
        } = dependencies;

        this._engagementHelper = new EngagementHelper().fromSource(engagementSource);
    }

    public execute(file: File, event: MouseEvent) {
        this._engagementHelper
            .withPart(uploadKey, {
                fileExtension: file.extension
            })
            .wuthPart(clickKey, {
                pointerType: event.pointerType
            })
            .logData();

        // ... perform the upload
    }
}
```

In the example, since the `execute` method adds a `'Click'` context before it calls `fire`, the resulting event
will include the parts `'Upload.Click'`.

A parent component which consumes `UploadAction` can supply its own engagement information as well:

``` typescript
export class Command {
    private _engagementHelper: EngagementHelper;
    private _action: UploadAction;

    constructor(params: {}, dependencies: {
        engagementSource?: IEngagementSource;
    }) {
        const {
            engagementSource 
        } = dependencies;

        this._engagementHelper = new EngagementHelper().fromSource(engagementSource).withPart(commandKey));

        this._action = new UploadAction({
            engagementSource: this._engagementHelper
        });
    }

    public onClick(event: MouseEvent) {
        const file = this._input.file;

        this._action.execute(file, event);
    }
}
```

In the above example, any engagement event fired by the `UploadAction` will include the part `'Command'`.

## Engagement Handlers

An application may choose to wrap instantiation of `EngagementHelper` with a factory which automatically attaches appropriate
`IEngagementHandler` types.

``` typescript
const contextHandler = new ContextEngagementHandler(pageContext);
const itemHandler = new ItemEngagementHandler();

export class CustomEngagementHelper extends EngagementHelper {
    constructor(params: IEngagementHelperParams) {
        super(params, {
            handlers: [
                contextHandler,
                itemHandler
            ]
        });
    }
}
```

Components can then then be defined to take the `EngagementHelper` type as a dependency:

``` typescript
export class UploadAction {
    constructor(params: {}, dependencies: {
        engagementSource: IEngagementSource,
        engagementHelperType: new (params?: IEngagementHelperParams) => EngagmentHelper;
    }) {
        const {
            engagementSource,
            engagementHelperType
        } = dependencies;

        this._engagementHelper = new engagementHelperType().fromSource(engagementSource);
    }
}
```

The custom type would then be supplied in `dependencies` for the component:

``` typescript
new UploadAction({ ... }, {
    engagementHelperType: CustomEngagementHelper
})
```

The purpose of an `IEngagementHandler` is to extract data for a given scenario and assign to valid fields for an `Engagement` event.

``` typescript
export class MyEngagementHandler implements IEngagementHandler {
    constructor(params: {}, dependencies: {}) {
        // Nothing needed.
    }

    public getEngagementData(context: typeof clickPart.context | typeof uploadPart.context): Partial<IEngagementSingleSchema> {
        if (uploadPart.matches(context)) {
            return {
                extraData: {
                    // Extract some value that the active UX components would not have
                    // easily available.
                    Upload_isReturningUser: Experiments.isReturningUser
                }
            };
        }
    }
}
```

The data returned from `getEngagementData` is merged with the engagement event which is ultimately fired.
