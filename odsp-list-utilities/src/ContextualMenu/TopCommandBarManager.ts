/** Manages the available commands in the top command bar of a list web part */
import { IContextualMenuItem, IconName, IIconProps } from 'office-ui-fabric-react';
import { IActionDependencies } from '../Actions/IAction';
import { ISPListItem } from '@ms/odsp-datasources/lib/SPListItemProcessor';
import { ISPItemSet } from '@ms/odsp-datasources/lib/providers/item/ISPItemSet';
import ColumnMenuHelper from './ColumnMenuHelper';
import { DocumentType } from '@ms/odsp-datasources/lib/interfaces/list/DocumentType';
import { isDocumentLibrary } from '@ms/odsp-datasources/lib/dataSources/listCollection/ListTemplateType';
import { isCustomContentTypesDisabled, getContentTypeCommandsCore } from './CommandHelper';
import { ISPContentType } from '@ms/odsp-datasources/lib/SPListItemRetriever';
import Features from '@ms/odsp-utilities/lib/features/Features';
import { ICommand } from './ICommand';
import { Command, ICommandParams } from './Command';

const VisioDrawingCreation = { ODB: 973 };

export interface ITopCommandBarManager {
    /**
     * Returns an array of IContextualMenuItems representing the commands that should be
     * rendered in the command bar, filtered based on the current state.
     *
     * @param { IActionDependencies } newDependencies If provided, the TopCommandBarManager will
     * regenerate the list of all possible commands using the new dependencies before filtering
     * them based on the current state.
     */
    getVisibleCommandBarItems(newDependencies?: IActionDependencies): IContextualMenuItem[];
}

export class TopCommandBarManager {

    private _deps: IActionDependencies;

    /**
     * allCommands stores all possible commands for the top command bar.
     * We can filter this array to get currently visible commands.
     */
    private _allCommands: ICommand[];

    constructor() {
        this._allCommands = [];
    }

    public getVisibleCommandBarItems(newDependencies?: IActionDependencies): IContextualMenuItem[] {
        if (newDependencies) {
            this._deps = newDependencies;
            this._allCommands = this._getAllCommands();
        }

        let filteredCommands: ICommand[] = this._allCommands.filter((command: ICommand) => { return command.isVisible() });
        return filteredCommands.map((command: ICommand) => command.getContextualMenuItem());
    }

    private _getAllCommands(): ICommand[] {
        const items: ICommand[] = [];
        const { listContext } = this._deps;
        const isDoclib: boolean = isDocumentLibrary(listContext.listTemplateType);

        // new
        items.push(this._getNewCommand());

        // rename
        if (isDoclib) {
            items.push(this._getRenameCommand());
        }

        return items;
    }

    // Copied from _computeNewChildren in odsp-next
    // @todo: add support for FileHandlerCommands
    private _getNewCommand(): ICommand {
        const { listContext, itemSet, selection, strings } = this._deps;
        const isDoclib: boolean = isDocumentLibrary(listContext.listTemplateType);
        const contentTypes: ISPContentType[] = itemSet && itemSet.contentTypes;
        const contentTypesDisabled: boolean = isCustomContentTypesDisabled(contentTypes, listContext);

        let defaultNewCommands = isDoclib ? this._getNewDoclibChildren() : this._getNewListChildren(contentTypes);
        const newFolderCommand = [ this._getNewFolder() ];
        const addLineBreakAfterFolder: boolean = isDoclib || contentTypesDisabled;
        if (addLineBreakAfterFolder) {
            newFolderCommand.push(new Command({ key: 'folderDivider', name: '-' }));
        }
        defaultNewCommands = newFolderCommand.concat(defaultNewCommands);

        let children: ICommand[] = [];
        if (contentTypesDisabled) {
            children = defaultNewCommands;
        } else {
            // Custom content types enabled. Generate content type commands.
            children = [
                ...newFolderCommand,
                ...this._getContentTypeCommands(contentTypes),
                this._getNewShortcut()
            ];
        }

        const newCommand: ICommand = new Command({
            key: 'new',
            name: strings.Create,
            iconProps: getIcon('Add'),
            isCommandVisible: this._isNoItemSelected.bind(this),
            children: children
        } as ICommandParams);
        return newCommand;
    }

    private _getRenameCommand(): ICommand {
        let actionMap = this._deps.actionMap;

        const renameCommand: ICommand = new Command({
            key: 'rename',
            name: this._deps.strings.rename,
            iconProps: getIcon('Edit'),
            action: new actionMap.renameAction({}, this._deps)
        } as ICommandParams);

        return renameCommand;
    }

    private _getContentTypeCommands(contentTypes: ISPContentType[]): ICommand[] {
        let { actionMap, listContext, itemUrlHelper, parentKey, pageContext } = this._deps;
        let dependencies = this._deps;

        function buildCreateDocumentCommand(key: string, name: string, iconUrl: string, icon: string, templateUrl: string): ICommand {
            return new Command({
                key: key,
                name: name,
                iconProps: getIcon(icon, iconUrl),
                action: new actionMap.createDocumentAction({
                    docType: DocumentType.Word,
                    templateUrl: templateUrl
                }, dependencies)
            } as ICommandParams);
        }

        function buildNavigationCommand(key: string, contentType: ISPContentType, iconUrl: string, icon: string, templateUrl: string, cTypeId: string): ICommand {
            return new Command({
                key: key,
                name: contentType.displayName,
                iconProps: getIcon(icon, iconUrl),
                action: new actionMap.contentTypeNavigationAction({
                    url: templateUrl,
                    appMap: contentType.appMap,
                    contentTypeId: cTypeId,
                    openInClient: !!contentType.appMap
                }, dependencies)
            } as ICommandParams);
        }

        return getContentTypeCommandsCore<ICommand>(contentTypes,
            pageContext,
            buildCreateDocumentCommand,
            buildNavigationCommand,
            itemUrlHelper.getItemUrlParts(parentKey),
            listContext);
    }

    private _getNewDoclibChildren(): ICommand[] {
        const dependencies = this._deps;
        const actionMap = dependencies.actionMap;
        const strings = dependencies.strings;
        const newCommands: ICommand[] = [
            new Command({
                key: 'newDoc',
                name: strings.CreateWord,
                iconProps: getIcon('WordLogo'),
                action: new actionMap.createDocumentAction({
                    docType: DocumentType.Word
                }, dependencies)
            } as ICommandParams),
            new Command({
                key: 'newExcel',
                name: strings.CreateExcel,
                iconProps: getIcon('ExcelLogo'),
                action: new actionMap.createDocumentAction({
                    docType: DocumentType.Excel
                }, dependencies)
            } as ICommandParams),
            new Command({
                key: 'newPPT',
                name: strings.CreatePowerPoint,
                iconProps: getIcon('PowerPointLogo'),
                action: new actionMap.createDocumentAction({
                    docType: DocumentType.PowerPoint
                }, dependencies)
            } as ICommandParams),
            new Command({
                key: 'newOneNote',
                name: strings.CreateOneNote,
                iconProps: getIcon('OneNoteLogo'),
                action: new actionMap.createDocumentAction({
                    docType: DocumentType.OneNote
                }, dependencies)
            } as ICommandParams),
            new Command({
                key: 'newXSLSurvey',
                name: strings.CreateExcelSurvey,
                iconProps: getIcon('ExcelLogo'),
                action: new actionMap.createDocumentAction({
                    docType: DocumentType.ExcelSurvey
                }, dependencies)
            } as ICommandParams),
            new Command({
                key: 'newXSLForm',
                name: strings.CreateFormForExcel,
                iconProps: getIcon('ExcelLogo'),
                action: new actionMap.createDocumentAction({
                    docType: DocumentType.ExcelForm
                }, dependencies)
            } as ICommandParams)
        ];

        if (dependencies.pageContext.isSPO && Features.isFeatureEnabled(VisioDrawingCreation)) {
            newCommands.push(new Command({
                key: 'newVisio',
                name: strings.CreateVisio,
                iconProps: getIcon('VisioLogo'),
                action: new actionMap.createDocumentAction({
                    docType: DocumentType.Visio
                }, dependencies)
            } as ICommandParams));
        }

        newCommands.push(this._getNewShortcut());

        return newCommands;
    }

    private _getNewListChildren(contentTypes: ISPContentType[]): ICommand[] {
        const { actionMap, listContext, strings }: IActionDependencies = this._deps;
        const allowCreateFolder: boolean = listContext && listContext.allowCreateFolder;
        const contentType: ISPContentType = contentTypes && contentTypes[0] ? contentTypes[0] : void 0;

        const newCommands: ICommand[] = [new Command({
                key: 'newListItem',
                name: strings.CreateListItem,
                iconProps: getIcon(allowCreateFolder ? 'Page' : 'Add'),
                action: new actionMap.createListItemAction({
                    contentType: contentType
                }, this._deps)
            } as ICommandParams)
        ];
        return newCommands;
    }

    private _getNewFolder(): ICommand {
        const dependencies = this._deps;
        const actionMap = dependencies.actionMap;
        return new Command({
            key: 'newFolder',
            name: dependencies.strings.CreateFolder,
            iconProps: getIcon('Folder'),
            action: new actionMap.createFolderAction({}, this._deps)
        } as ICommandParams);
    }

    private _getNewShortcut(): ICommand {
        const dependencies = this._deps;
        const actionMap = dependencies.actionMap;
        return new Command({
            key: 'newShortcut',
            name: dependencies.strings.CreateShortcut,
            iconProps: getIcon('Globe'),
            action: new actionMap.launchCreateShortcutPanelAction({}, dependencies)
        } as ICommandParams);
    }

    private _isNoItemSelected(): boolean {
        let numberItemsSelected = this._deps.selection.getSelectedCount();
        return numberItemsSelected === 0;
    }
}

function getIcon(icon: string, iconUrl?: string): IIconProps {
    let iconProps: IIconProps = icon ? {
            iconName: icon as IconName
        } : {
            iconName: 'CustomIcon',
            style: {
                backgroundImage: `url(${iconUrl})`,
                width: '16px',
                height: '16px'
            }
        };
    return iconProps;
}
