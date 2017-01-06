export interface IFileHandler {
    /** The GUID of the file handler */
    readonly id: string;
    /** The GUID of the app that owns the file handler */
    readonly appId: string;
    /** The display name of the app that owns the file handler */
    readonly displayName: string;

    /** The set of file extensions handled by the file handler */
    readonly extensions: Array<string>;
    /** The url to an icon for the file type */
    fileIcon?: string;
    /** The display name for the file type */
    fileTypeName?: string;
}

export interface IFileHandlerCustomAction {
    /** The type of the action */
    readonly type: 'custom';
    /** The IFileHandler that owns the action */
    readonly handler: IFileHandler;
    /** The url to post data to when invoked */
    readonly url: string;
    /** The selection mode for the action */
    readonly selection: 'single' | 'multiple';
    /** The friendly display name of the action */
    readonly title: string;
    /** Whether or not the action accepts folders as valid input */
    readonly allowFolders?: boolean;
}

export interface IFileHandlerStandardAction {
    /** The type of the action */
    readonly type: 'new' | 'open' | 'preview';
    /** The IFileHandler that owns the action */
    readonly handler: IFileHandler;
    /** The url to post data to when invoked */
    readonly url: string;
}

export type IFileHandlerAction = IFileHandlerCustomAction | IFileHandlerStandardAction;

export interface IFileHandlerPreferences {
    /** The file handler action to use to preview files with this extension */
    previewWith?: IFileHandlerStandardAction;
    /** The file handler action to use to open files with this extension */
    openWith?: IFileHandlerStandardAction;
}

export interface IFileHandlerData {
    /** All known custom actions */
    readonly customActions: ReadonlyArray<IFileHandlerCustomAction>;
    /** All known new file actions */
    readonly newActions: ReadonlyArray<IFileHandlerStandardAction>;
    /** All known open file actions */
    readonly openActions: ReadonlyArray<IFileHandlerStandardAction>;
    /** All known preview file actions */
    readonly previewActions: ReadonlyArray<IFileHandlerStandardAction>;
    /** The user's preferred open and preview actions for each file extension */
    readonly preferences: { readonly [extension: string]: IFileHandlerPreferences; };
}

export interface IStoredFileHandlerCustomAction {
    readonly type: 'custom';
    readonly handlerId: string;
    readonly url: string;
    readonly selection: 'single' | 'multiple';
    readonly title: string;
    readonly allowFolders?: boolean;
}

export interface IStoredFileHandlerStandardAction {
    readonly type: 'new' | 'open' | 'preview';
    readonly handlerId: string;
    readonly url: string;
}

export type IStoredFileHandlerAction = IStoredFileHandlerCustomAction | IStoredFileHandlerStandardAction;

export interface IStoredFileHandlerPreferences {
    previewWith?: string;
    openWith?: string;
}

export interface IStoredFileHandlerData {
    readonly actions: ReadonlyArray<IStoredFileHandlerAction>;
    readonly handlers: { readonly [id: string]: IFileHandler; };
    readonly preferences: { readonly [extension: string]: IStoredFileHandlerPreferences };
}

export type IInvokeHandlerCommonParams = {
    /** The file handler action to invoke */
    action: IFileHandlerAction;
    /** An iframe to host the page in */
    iframe: HTMLIFrameElement;
} | {
    /** The file handler action to invoke */
    action: IFileHandlerAction;
    /** The name of the window to host the page in */
    target: string;
}

export type IInvokeHandlerParams = IInvokeHandlerCommonParams & {
    /** Information about the current environment. */
    context: IFileHandlerSharedPostData,
    /** The graph API urls of the items */
    itemUrls: string[];
}

export interface IFileHandlerSharedPostData {
    /** BCP-47 language tag, e.g. en-US */
    cultureName: string;
    /** URL of the current resource, e.g. https://microsoft-my.sharepoint.com */
    resourceId: string;
    /** Identifier for the client, e.g. 'OneDrive' */
    client: string;
    /** The user's email address */
    userId: string;
}

/**
 * Converts IStoredFileHandlerData to IFileHandlerData for use
 */
export function unpackFileHandlerData(this: void, storedData: IStoredFileHandlerData): IFileHandlerData {
    const customActions: IFileHandlerCustomAction[] = [];
    const newActions: IFileHandlerStandardAction[] = [];
    const openActions: IFileHandlerStandardAction[] = [];
    const previewActions: IFileHandlerStandardAction[] = [];

    const openActionMap: { [handlerId: string]: IFileHandlerStandardAction; } = {};
    const previewActionMap: { [handlerId: string]: IFileHandlerStandardAction; } = {};

    for (const storedAction of storedData.actions) {
        const {
            handlerId
        } = storedAction;

        const unpackedAction: IFileHandlerAction = {
            handler: storedData.handlers[handlerId],
            ...storedAction
        };

        switch (unpackedAction.type) {
            case 'custom':
                customActions.push(unpackedAction);
                break;
            case 'new':
                newActions.push(unpackedAction);
                break;
            case 'open':
                openActions.push(unpackedAction);
                openActionMap[handlerId] = unpackedAction;
                break;
            case 'preview':
                previewActions.push(unpackedAction);
                previewActionMap[handlerId] = unpackedAction;
                break;
        }
    }

    const unpackedPreferences: { [extension: string]: IFileHandlerPreferences; } = {};
    for (const id of Object.keys(storedData.preferences)) {
        const unpackedPreference: IFileHandlerPreferences = {};
        const {
            openWith,
            previewWith
        } = storedData.preferences[id];

        if (openWith) {
            unpackedPreference.openWith = openActionMap[openWith];
        }
        if (previewWith) {
            unpackedPreference.previewWith = previewActionMap[previewWith];
        }

        unpackedPreferences[id] = unpackedPreference;
    }

    return {
        customActions: customActions,
        newActions: newActions,
        openActions: openActions,
        previewActions: previewActions,
        preferences: unpackedPreferences
    };
}

/**
 * Gets the default file handler action used to open files with the specified extension
 */
export function getDefaultOpenHandler(this: void, data: IFileHandlerData, extension: string): IFileHandlerStandardAction {
    const preferences = data.preferences[extension.toLowerCase()];
    return preferences && preferences.openWith;
}

/**
 * Gets the default file handler action used to preview files with the specified extension
 */
export function getDefaultPreviewHandler(this: void, data: IFileHandlerData, extension: string): IFileHandlerStandardAction {
    const preferences = data.preferences[extension.toLowerCase()];
    return preferences && preferences.previewWith;
}

/**
 * Gets the file type icon to use for files with the specified extension
 */
export function getFileTypeIconUrl(this: void, data: IFileHandlerData, extension: string): string {
    const preferences = data.preferences[extension.toLowerCase()];
    if (preferences) {
        const previewWith = preferences.previewWith;
        const openWith = preferences.openWith;
        return (previewWith && previewWith.handler.fileIcon) || (openWith && openWith.handler.fileIcon);
    }
}

/**
 * Gets the file type name to use for files with the specified extension
 */
export function getFileTypeName(this: void, data: IFileHandlerData, extension: string): string {
    const preferences = data.preferences[extension.toLowerCase()];
    if (preferences) {
        const previewWith = preferences.previewWith;
        const openWith = preferences.openWith;
        return (previewWith && previewWith.handler.fileTypeName) || (openWith && openWith.handler.fileTypeName);
    }
}

/**
 * Determines whether a given IFileHandlerAction is applicable to the specified file extension
 */
export function isActionForExtension(this: void, action: IFileHandlerAction, extension: string) {
    if (extension && extension.length > 0) {
        const extensions = action.handler.extensions;
        return extensions.indexOf(extension.toLowerCase()) >= 0 || extensions.indexOf('.*') >= 0;
    }

    return false;
}

/**
 * Invokes a file handler action.
 */
export function invokeHandlerAction(this: void, params: IInvokeHandlerParams): void {
    const action = params.action;
    const postdata = {
        appId: action.handler.appId,
        items: JSON.stringify(params.itemUrls),
        ...params.context
    };

    const iframe = (params as { iframe: HTMLIFrameElement }).iframe;

    // Create form, post to target
    let form = document.createElement('form');
    form.action = action.url;
    form.target = iframe ? '_self' : ((params as { target: string }).target || '_blank');
    form.method = 'POST';
    for (const param in postdata) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = param;
        input.value = postdata[param];
        form.appendChild(input);
    }

    if (iframe) {
        const iframeDocument = iframe.contentDocument;
        if (iframeDocument.body === null) {
            iframeDocument.write('<body></body>');
        }
        iframeDocument.body.appendChild(form);
        form = iframeDocument.getElementsByTagName('form')[0];
    }
    form.submit();
}