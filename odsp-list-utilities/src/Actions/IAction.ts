import { ISPListContext } from '@ms/odsp-datasources/lib/SPListItemRetriever';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { ISortMenuStrings } from '../ContextualMenu/ColumnUtilities';

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
}

export interface IActionStrings extends ISortMenuStrings {
    columnMenuFilter: string;
    columnMenuGroup: string;
}

export interface IActionMap {
    sortAction: new (params: any, dependencies: IActionDependencies) => IAction;
    groupAction: new (params: any, dependencies: IActionDependencies) => IAction;
    launchFilterPanelAction: new (params: any, dependencies: IActionDependencies) => IAction;
}