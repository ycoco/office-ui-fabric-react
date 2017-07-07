// OneDrive:IgnoreCodeCoverage

// import * as React from 'react';
import { INavLinkGroup, INavLink } from 'office-ui-fabric-react/lib/components/Nav';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { IEditNavCalloutProps } from '../../EditNavCallout';

/* odsp-shared-react */
import { IEditNavStateManagerParams } from './EditNavStateManager.Props';
import { IEditNavProps, IEditNavLink, EditNavDataCache, IEditNavContextMenuStringProps } from '../../EditNav';
import { HORIZONTAL_NAV_HOME_NODE_ID, NAV_RECENT_NODE_ID } from '../compositeHeader/StateManager';

/* odsp-datasources */
import { ISpPageContext as IHostSettings, isGroupWebContext, INavNode } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { EditNavDataSource } from '@ms/odsp-datasources/lib/EditNav';
import { SourceType } from '@ms/odsp-datasources/lib/interfaces/groups/SourceType';

/* odsp-utilities */
import Async from '@ms/odsp-utilities/lib/async/Async';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import { IGroupsProvider } from '@ms/odsp-datasources/lib/Groups';

/* quickLaunch link group index */
const QUICKLAUNCH_INDEX = 0;

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
    private _groupPropertyUrl: { [index: string]: string };

    constructor(params: IEditNavStateManagerParams) {
        this._params = params;
        this._hostSettings = params.hostSettings;
        this._async = new Async();
        this._eventGroup = new EventGroup(this);
        this._isGroup = isGroupWebContext(params.hostSettings);
        this._groupPropertyUrl = {};
    }

    public componentWillMount() {
        if (!this._params.groups) {
            this._params.groups = this._getNavLinkFromNavNode(QUICKLAUNCH_INDEX);
        }
        this._data = new EditNavDataCache(this._params.groups);
        this._editNavDataSource = new EditNavDataSource(this._hostSettings, this._params.strings.pagesTitle, undefined);
        if (this._isGroup && this._params.getGroupsProvider) {
            this._params.getGroupsProvider().done((groupsProvider: IGroupsProvider) => {
                if (groupsProvider) {
                    this._groupsProvider = groupsProvider;
                    if (!this._groupsProvider.group) {
                        throw new Error('EditNavStateManager fatal error: Groups provider does not have an observed group.');
                    }
                    this._updateO365GroupsInfo();
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

    public updateGroupsIndex(gorupIndex: number) {
        // By design now, edit only apply to QuickLaunc since topNav is going away.
        this._params.groups = this._getNavLinkFromNavNode(QUICKLAUNCH_INDEX);
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
            ariaLabel: params.strings.ariaLabel || 'Navigation control edit panel. Use arrow keys to navigate',
            expandedStateText: params.strings.expandedStateText,
            addLinkTitle: params.strings.addLinkTitle,
            editLinkTitle: params.strings.editLinkTitle,
            ariaLabelContextMenu: params.strings.ariaLabelContextMenu,
            editNavCalloutProps: this._getEditNavCalloutProps(),
            editNavContextMenuProps: this._getEditNavContextMenuStringProps()
        };

        return editNavProps;
    }

    private _getNavLinkFromNavNode(groupIndex: number): INavLinkGroup[] {
        let groups: INavLinkGroup[] = [];
        let editLinks: IEditNavLink[] = [];
        const isQuickLaunch = groupIndex === QUICKLAUNCH_INDEX;
        let nodes: INavNode[] = (isQuickLaunch && this._hostSettings.navigationInfo) ?
            this._hostSettings.navigationInfo.quickLaunch : this._hostSettings.navigationInfo.topNav;

        if (nodes && nodes.length > 0) {
            editLinks = nodes
                .filter((node: INavNode) =>
                    node.Id !== HORIZONTAL_NAV_HOME_NODE_ID ||
                    isQuickLaunch && node.Id !== NAV_RECENT_NODE_ID) // remove the home link from the topnav, Recent node if quickLaunch
                .map((node: INavNode) => ({
                    name: node.Title,
                    url: node.Url,
                    key: node.Id.toString(),
                    links: (node.Children && node.Children.length) ?
                        node.Children.map((childNode: INavNode) => ({
                            name: childNode.Title,
                            url: childNode.Url,
                            key: childNode.Id.toString()
                        })) : undefined
                }));
            groups.push({ links: editLinks });
        }
        return groups;
    }

    private _updateO365GroupsInfo(): void {
        const params = this._params;
        const linkToInfo = params.groupLinkToInfo;
        if (this._isGroup && this._groupsProvider) {
            const group = this._groupsProvider.group;
            // fill the Group resources links.
            let updateGroupProperties = (newValue: SourceType) => {
                if (newValue !== SourceType.None && group) {
                    if (linkToInfo && linkToInfo.length) {
                        for (let i = 0; i < linkToInfo.length; i++) {
                            let url = group[linkToInfo[i].keyName];
                            if (url) {
                                this._groupPropertyUrl[linkToInfo[i].keyName] = url;
                            }
                        }
                    }
                }
            };

            this._eventGroup.on(group, 'source', updateGroupProperties);
            updateGroupProperties(group.source);
        }
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
                    let url = this._groupPropertyUrl[linkToInfo[i].keyName];
                    if (url) {
                        links.push({
                            name: linkToInfo[i].title,
                            icon: linkToInfo[i].icon,
                            url: url,
                            engagementName: linkToInfo[i].keyName
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
                    this._params.parentContainer.setState({ groups: srvgroups });
                });
            }
        });
        this._params.onSaved();
        this._params.parentContainer.setState({ groups: this._data.getViewGroups() });
    }

    @autobind
    private _onCancelClick(): void {
        Engagement.logData({ name: 'EditNav.Cancel.Click' });
        this._params.onCancel(this._params.groups);
    }
}

export default EditNavStateManager;
