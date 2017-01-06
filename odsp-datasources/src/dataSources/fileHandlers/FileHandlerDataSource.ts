import Promise from '@ms/odsp-utilities/lib/async/Promise';
import DataRequestor, { IDataRequestorParams } from '../base/DataRequestor';
import ISpPageContext from '../../interfaces/ISpPageContext';
import { IFileHandler, IStoredFileHandlerAction, IStoredFileHandlerPreferences, IStoredFileHandlerData } from './FileHandlers';

interface IAddIn<T> {
    type: string;

    appId: string;
    addInId: string;
    displayName: string;

    properties: T;
}

interface IFileHandlerActionEntry {
    url: string;
    selection: 'single' | 'multiple';
    platform: Array<string>;
    title: string;
    allowFolders?: boolean;
}

interface IFileHandlerProperties {
    extension: string;
    fileIcon?: string;
    fileTypeName?: string;

    version: number;

    newFileUrl?: string;
    openUrl?: string;
    previewUrl?: string;

    actions?: string | Array<IFileHandlerActionEntry>;
}

interface IGetByTypeResponse {
    d: {
        GetByType: string;
    };
}

export interface IFileHandlerDataSourceParams {
    // Nothing
}

export interface IFileHandlerDataSourceDependencies {
    dataRequestorType: new (params: IDataRequestorParams) => DataRequestor;
    pageContext: ISpPageContext;
}

/**
 * OneDrive for Business DataSource for File Handler add-ins.
 */
export class FileHandlerDataSource {
    private readonly _dataRequestor: DataRequestor;
    private readonly _pageContext: ISpPageContext;

    constructor(params: IFileHandlerDataSourceParams, dependencies: IFileHandlerDataSourceDependencies) {
        this._pageContext = dependencies.pageContext;
        this._dataRequestor = new dependencies.dataRequestorType({
            qosName: 'FileHandlerDataSource'
        });
    }

    public getFileHandlerData(): Promise<IStoredFileHandlerData> {
        return this._dataRequestor.getData<IGetByTypeResponse>({
            url: `${this._pageContext.webAbsoluteUrl}/_api/apps/GetByType('FileHandler')`,
            qosName: 'GetAddIns'
        }).then((response: IGetByTypeResponse) => {
            const data: string = (response && response.d && response.d.GetByType);
            return <Array<IAddIn<IFileHandlerProperties>>>(data && JSON.parse(data) || []);
        }).then((addIns: IAddIn<IFileHandlerProperties>[]) => {
            const regex = /^javascript:/i;
            const handlers: { [id: string]: IFileHandler; } = {};
            const preferences: { [extension: string]: IStoredFileHandlerPreferences; } = {};

            const storedActions: IStoredFileHandlerAction[] = [];

            for (const addIn of addIns) {
                const {
                    extension = '',
                    fileIcon,
                    fileTypeName,
                    newFileUrl,
                    openUrl,
                    previewUrl,
                    version
                } = addIn.properties;

                let {
                    actions
                } = addIn.properties;

                const id = addIn.addInId;

                const extensions = extension.toLowerCase().split(';').map((ext: string) => (ext.length > 0 && ext[0] !== '.') ? `.${ext}` : '');
                let newFileExtension;
                if (extensions[0] && extensions[0] !== '' && extensions[0] !== '.*') {
                    newFileExtension = extensions[0];
                }

                let parsedActions: IFileHandlerActionEntry[];

                if (actions) {
                    if (typeof actions === 'string') {
                        try {
                            actions = JSON.parse(<string>actions);
                            if (typeof actions === 'object') {
                                actions = actions['actions'];
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                    parsedActions = <IFileHandlerActionEntry[]>actions;
                }

                const handler: IFileHandler = {
                    id: id,
                    appId: addIn.appId,
                    displayName: addIn.displayName,
                    extensions: extensions
                };
                if (fileIcon && !regex.test(fileIcon)) {
                    handler.fileIcon = fileIcon;
                }
                if (fileTypeName) {
                    handler.fileTypeName = fileTypeName;
                }
                handlers[id] = handler;

                if (newFileUrl && newFileExtension && !regex.test(newFileUrl)) {
                    storedActions.push({
                        type: 'new',
                        handlerId: id,
                        url: version ? newFileUrl : this._getRedirectFileHandlerUrl(newFileUrl)
                    });
                }
                if (openUrl && !regex.test(openUrl)) {
                    storedActions.push({
                        type: 'open',
                        handlerId: id,
                        url: version ? openUrl : this._getRedirectFileHandlerUrl(openUrl)
                    });
                }
                if (previewUrl && !regex.test(previewUrl)) {
                    storedActions.push({
                        type: 'preview',
                        handlerId: id,
                        url: version ? previewUrl : this._getRedirectFileHandlerUrl(previewUrl)
                    });
                }

                for (const action of parsedActions || []) {
                    if (action.url && !regex.test(action.url)) {
                        storedActions.push({
                            type: 'custom',
                            handlerId: id,
                            ...action
                        });
                    }
                }

                // Generate default preferences (last in list)
                if (openUrl || previewUrl) {
                    for (const ext of extensions) {
                        const prefs: IStoredFileHandlerPreferences = preferences[ext] || (preferences[ext] = {});
                        if (openUrl && !regex.test(openUrl)) {
                            prefs.openWith = id;
                        }
                        if (previewUrl && !regex.test(previewUrl)) {
                            prefs.previewWith = id;
                        }
                    }
                }

            }

            return {
                handlers: handlers,
                preferences: preferences,
                actions: storedActions
            };
        });
    }

    private _getRedirectFileHandlerUrl(url: string): string {
        return url;
    }
}

export default FileHandlerDataSource;