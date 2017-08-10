import Promise from '@ms/odsp-utilities/lib/async/Promise';
import DataRequestor, { IDataRequestorParams } from '../base/DataRequestor';
import ISpPageContext from '../../interfaces/ISpPageContext';
import { IFileHandler, IStoredFileHandlerAction, IStoredFileHandlerPreferences, IStoredFileHandlerData } from './FileHandlers';
import DataStore from '@ms/odsp-utilities/lib/models/store/BaseDataStore';
import DataStoreCachingType from '@ms/odsp-utilities/lib/models/store/DataStoreCachingType';

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

const regex = /^javascript:/i;

/**
 * OneDrive for Business DataSource for File Handler add-ins.
 */
export class FileHandlerDataSource {
    private readonly _dataRequestor: DataRequestor;
    private readonly _pageContext: ISpPageContext;
    private _dataPromise: Promise<IStoredFileHandlerData>;

    constructor(params: IFileHandlerDataSourceParams, dependencies: IFileHandlerDataSourceDependencies) {
        this._pageContext = dependencies.pageContext;
        this._dataRequestor = new dependencies.dataRequestorType({
            qosName: 'FileHandlerDataSource'
        });
    }

    public getFileHandlerData(): Promise<IStoredFileHandlerData> {
        if (this._dataPromise) {
            return this._dataPromise;
        }

        const pageContext = this._pageContext;
        const rawPromise = this._dataRequestor.getData<IGetByTypeResponse>({
            url: `${pageContext.webAbsoluteUrl}/_api/apps/GetByType('FileHandler')`,
            qosName: 'GetAddIns'
        }).then((response: IGetByTypeResponse) => {
            const data = response && response.d && response.d.GetByType;
            return <Array<IAddIn<IFileHandlerProperties>>>(data && JSON.parse(data) || []);
        });

        // V1 Back compatibility
        rawPromise.done((addIns: IAddIn<IFileHandlerProperties>[]) => {
            const dataStore = new DataStore(`Office365.AddIns.FileHandler.${pageContext.userId}`, DataStoreCachingType.local);
            const data = addIns.filter((addIn: IAddIn<IFileHandlerProperties>) => !addIn.properties.version);
            dataStore.setValue('', data);
            dataStore.setValue('.LocalStorageSetTime', Date.now(), DataStoreCachingType.local, false);
        });

        // V2
        return this._dataPromise = rawPromise.then((addIns: IAddIn<IFileHandlerProperties>[]) => {
            const handlers: { [id: string]: IFileHandler; } = {};
            const preferences: { [extension: string]: IStoredFileHandlerPreferences; } = {};

            const storedActions: IStoredFileHandlerAction[] = [];
            // Redirect v1 file handlers to the Sharepoint interstitial page.
            const redirectUrlBase = `${pageContext.webAbsoluteUrl}/${pageContext.layoutsUrl}/online/cloudappsredirect.aspx?addintype=FileHandler&usemds=false`;

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

                let parsedActions: IFileHandlerActionEntry[];
                if (actions) {
                    if (typeof actions === 'string') {
                        try {
                            actions = JSON.parse(actions);
                            if (typeof actions === 'object') {
                                actions = actions['actions'];
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                    parsedActions = <IFileHandlerActionEntry[]>actions;
                }

                const id = addIn.addInId;
                const appId = addIn.appId;
                const extensions = extension.toLowerCase().split(';').map((ext: string) => (ext && ext[0] !== '.') ? `.${ext}` : '');

                const addStandardAction = (type: 'new' | 'open' | 'preview', url: string) => {
                    if (url && !regex.test(url)) {
                        storedActions.push({
                            type: type,
                            handlerId: id,
                            url: version ? url : `${redirectUrlBase}&appid=${appId}&appurl=${encodeURIComponent(url)}`
                        });
                    }
                }

                const handler: IFileHandler = handlers[id] = {
                    id: id,
                    appId: appId,
                    displayName: addIn.displayName,
                    extensions: extensions
                };

                if (fileIcon && !regex.test(fileIcon)) {
                    handler.fileIcon = fileIcon;
                }
                if (fileTypeName) {
                    handler.fileTypeName = fileTypeName;
                }

                if (extensions[0] && extensions[0] !== '.*') {
                    addStandardAction('new', newFileUrl);
                }
                addStandardAction('open', openUrl);
                addStandardAction('preview', previewUrl);

                if (parsedActions) {
                    for (const action of parsedActions) {
                        if (action.url && !regex.test(action.url)) {
                            storedActions.push({
                                type: 'custom',
                                handlerId: id,
                                ...action
                            } as any);
                        }
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
}

export default FileHandlerDataSource;