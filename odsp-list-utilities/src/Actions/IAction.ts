import { ISPListContext } from '@ms/odsp-datasources/lib/SPListItemRetriever';
import { ISPListItem } from '@ms/odsp-datasources/lib/SPListItemProcessor';
import { ISPItemSet } from '@ms/odsp-datasources/lib/providers/item/ISPItemSet';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { ISortMenuStrings } from '../ContextualMenu/ColumnUtilities';
import { IProgressStrings } from '../Components/progressCommand/ProgressCommand.Props';
import PlatformDetection from '@ms/odsp-utilities/lib/browser/PlatformDetection';
import Async from '@ms/odsp-utilities/lib/async/Async';
import { ItemUrlHelper, ApiUrlHelper } from '@ms/odsp-datasources/lib/Url';
import { ISelection } from 'office-ui-fabric-react/lib/utilities/selection/index';

export interface IAction {
    name: string;
    isAvailable(): boolean;
    execute(eventArgs: any): Promise<{}>;
}

export interface IActionDependencies {
    eventContainer: any;
    contextKey: string;
    listContext: ISPListContext;
    pageContext: ISpPageContext;
    parentKey: string;
    actionMap: IActionMap;
    strings: IActionStrings;
    dataManager?: {
        invalidateItem: (itemId: string, options?: { triggerFetch?: boolean; emptyAllOtherSets?: boolean; refreshSchema?: boolean; }, contextKey?: string) => void;
    };
    async?: Async;
    itemUrlHelper?: ItemUrlHelper;
    apiUrlHelper?: ApiUrlHelper;
    itemSet?: ISPItemSet;
    rootItem?: ISPListItem;
    platformDetection?: PlatformDetection;
    selection?: ISelection;
}

export interface ICreateDocumentStrings {
    Create?: string;
    CreateWord?: string;
    CreateExcel?: string;
    CreatePowerPoint?: string;
    CreateOneNote?: string;
    CreateExcelSurvey?: string;
    CreateFormForExcel?: string;
    CreateVisio?: string;
    CreateFolder?: string;
    CreateShortcut?: string;
    CreateListItem?: string;
    CreateText?: string;
}

export interface IActionStrings extends ISortMenuStrings, ICreateDocumentStrings, IProgressStrings {
    columnMenuFilter: string;
    columnMenuGroup: string;
    rename?: string;
    upload?: string;
    uploadFile?: string;
    uploadFolder?: string;
}

export interface IActionMap {
    sortAction: new (params: any, dependencies: IActionDependencies) => IAction;
    groupAction: new (params: any, dependencies: IActionDependencies) => IAction;
    launchFilterPanelAction: new (params: any, dependencies: IActionDependencies) => IAction;
    createDocumentAction?: new (params: any, dependencies: IActionDependencies) => IAction;
    createFolderAction?: new (params: any, dependencies: IActionDependencies) => IAction;
    launchCreateShortcutPanelAction?: new (params: any, dependencies: IActionDependencies) => IAction;
    createListItemAction?: new (params: any, dependencies: IActionDependencies) => IAction;
    contentTypeNavigationAction?: new (params: any, dependencies: IActionDependencies) => IAction;
    renameAction?: new (params: any, dependencies: IActionDependencies) => IAction;
    uploadAction?: new (params: any, dependencies: IActionDependencies) => IAction;
}