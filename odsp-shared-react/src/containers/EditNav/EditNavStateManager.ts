// OneDrive:IgnoreCodeCoverage

// import * as React from 'react';
import { INavLinkGroup, INavLink } from 'office-ui-fabric-react/lib/components/Nav';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { IEditNavCalloutProps } from '../../EditNavCallout';

/* odsp-shared-react */
import { IEditNavStateManagerParams } from './EditNavStateManager.Props';
import { IEditNavProps, EditNavDataCache, IEditNavContextMenuStringProps } from '../../EditNav';

/* odsp-datasources */
import { ISpPageContext as IHostSettings, isGroupWebContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { EditNavDataSource } from '@ms/odsp-datasources/lib/EditNav';

/* odsp-utilities */
import Async from '@ms/odsp-utilities/lib/async/Async';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import { Group, IGroupsProvider } from '@ms/odsp-datasources/lib/Groups';

/**
 * This class manages the state of the EditNav.
 */
export class EditNavStateManager {
    public _data: EditNavDataCache;
    private _params: IEditNavStateManagerParams;
    private _hostSettings: IHostSettings;
    private _editNavDataSource: EditNavDataSource;
    private _async: Async;
    private _eventGroup: EventGroup;
    private _isGroup: boolean;
    private _groupsProvider: IGroupsProvider;

    constructor(params: IEditNavStateManagerParams) {
        this._params = params;
        this._hostSettings = params.hostSettings;
        this._async = new Async();
        this._eventGroup = new EventGroup(this);
        this._isGroup = isGroupWebContext(params.hostSettings);
    }

    public componentWillMount() {
        this._data = new EditNavDataCache(this._params.groups);
        this._editNavDataSource = new EditNavDataSource(this._hostSettings, this._params.strings.pagesTitle, undefined);
        if (this._isGroup) {
            this._params.getGroupsProvider().done((groupsProvider: IGroupsProvider) => {
                if (groupsProvider) {
                    this._groupsProvider = groupsProvider;
                    if (!this._groupsProvider.group) {
                        throw new Error('EditNavStateManager fatal error: Groups provider does not have an observed group.');
                    }
                }
            });
        }
    }

    public componentWillUnmount() {
        this._async.dispose();
        if (this._eventGroup) {
            this._eventGroup.dispose();
            this._eventGroup = null;
        }
    }

    public updateGroups(groups: INavLinkGroup[]) {
        this._params.groups = groups;
    }

    public getEditNavProps(): IEditNavProps {
        const params = this._params;

        const editNavProps: IEditNavProps = {
            groups: this._data._groups,
            isOnTop: params.isOnTop,
            dataCache: this._data,
            onSave: this._onSaveClick,
            onCancel: this._onCancelClick,
            saveButtonLabel: params.strings.saveButtonLabel,
            cancelButtonLabel: params.strings.cancelButtonLabel,
            expandedStateText: params.strings.expandedStateText,
            addLinkTitle: params.strings.addLinkTitle,
            editLinkTitle: params.strings.editLinkTitle,
            ariaLabelContextMenu: params.strings.ariaLabelContextMenu,
            editNavCalloutProps: this._getEditNavCalloutProps(),
            editNavContextMenuProps: this._getEditNavContextMenuStringProps()
        };

        return editNavProps;
    }

    private _getEditNavCalloutProps(): IEditNavCalloutProps {
        const params = this._params;
        const linkToInfo = params.groupLinkToInfo;
        let links: INavLink[] = [];
        // fill the Group resources links.
        if (this._isGroup && this._groupsProvider) {
            const group = this._groupsProvider.group;
            if (group && linkToInfo && linkToInfo.length) {
                for (let i = 0; i < linkToInfo.length; i++) {
                    let url = group[linkToInfo[i].keyName];
                    if (url) {
                        links.push({
                            name: linkToInfo[i].title,
                            icon: linkToInfo[i].icon,
                            url: url,
                            engagementId: linkToInfo[i].title + '.Click'
                        });
                    }
                }
            }
        }
        const calloutProps: IEditNavCalloutProps = {
            title: params.strings.addLinkTitle,
            okLabel: params.strings.okLabel,
            cancelLabel: params.strings.cancelButtonLabel,
            addressPlaceholder: params.strings.addressPlaceholder,
            displayPlaceholder: params.strings.displayPlaceholder,
            addressLabel: params.strings.addressLabel,
            displayLabel: params.strings.displayLabel,
            errorMessage: params.strings.errorMessage,
            openInNewTabText: params.strings.openInNewTabText,
            linkToLabel: params.strings.linkToLabel,
            linkToLinks: links
        };
        return calloutProps;
    }

    private _getEditNavContextMenuStringProps(): IEditNavContextMenuStringProps {
        const params = this._params;
        const contextMenuStrings: IEditNavContextMenuStringProps = {
            editText: params.strings.editText,
            moveupText: params.strings.moveupText,
            movedownText: params.strings.movedownText,
            removeText: params.strings.removeText,
            indentlinkText: params.strings.indentlinkText,
            promotelinkText: params.strings.promotelinkText
        };
        return contextMenuStrings;
    }

    @autobind
    private _onSaveClick(groups: INavLinkGroup[]): void {
        Engagement.logData({ name: 'EditNav.Save.Click' });
        this._editNavDataSource.onSave(groups).then((result: boolean) => {
            if (result) {
                this._editNavDataSource.getMenuState().then((srvgroups: INavLinkGroup[]) => {
                    this._params.onSaved();
                    this._params.reactLeftNav.setState({ groups: srvgroups });
                });
            } else {
                this._params.reactLeftNav.setState({ errorMessage: 'Save failed' });
            }
        });
        this._params.onSaved();
        this._params.reactLeftNav.setState({ groups: this._data.getViewGroups() });
    }

    @autobind
    private _onCancelClick(): void {
        Engagement.logData({ name: 'EditNav.Cancel.Click' });
        this._params.onCancel();
    }
}

export default EditNavStateManager;
