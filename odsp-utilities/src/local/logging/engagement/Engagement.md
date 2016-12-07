
# Engagment Module

The first thing to do is define some `EngagementKey` instances which specify event names and types that will be used in the application.

``` typescript
export interface IUploadData {
    fileExtension: string;
}

export const uploadKey: EngagementKey<'Upload', IUploadData> = new EngagementKey<'Click', IUploadData>('Upload', EngagementType.intent);

export interface IClickData {
    pointerType: string;
}

export const clickKey: EngagementKey<'Click', IClickData> = new EngagementKey<'Click', IClickData>('Click', EngagementType.event);
```

The next thing to do is define a class which implements `IEngagementHandler`.
The purpose of the `IEngagementHandler` is to extract data for a given scenario and assign to valid fields for an `Engagement` event.

``` typescript
export class MyEngagementHandler implements IEngagementHandler {
    constructor(params: {}, dependencies: {}) {
        // Nothing needed.
    }

    public getEngagementData(context: typeof clickKey.context | typeof uploadKey.context) {
        switch (context.name) {
            case uploadKey.name:
                return {
                    extraData: {
                        upload_FileExtension: context.fileExtension
                    }
                };
        }
    }
}
```

To fire `Engagement` events, create an instance of `EngagementHelper` in a component.
Use `prepare` and `fire` to indicate engagement with a particular event.

``` typescript
export class MyUploadComponent {
    private _engagementHelper: EngagementHelper;

    constructor(params: {}, dependencies: {}) {
        this._engagementHelper = new EngagementHelper({}, {
            handlerTypes: [MyEngagementHandler]
        });
    }

    public upload(file: File) {
        this._engagementHelper
            .create(uploadKey).withData({
                fileExtension: file.extension
            })
            .fire();

        ...
    }
}
```

An application may choose to wrap instantiation of `EngagementHelper` with a factory which automatically attaches appropriate
`IEngagementHandler` types.
