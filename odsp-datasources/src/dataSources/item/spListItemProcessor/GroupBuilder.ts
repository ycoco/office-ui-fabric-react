import { ISPListContext } from '../spListItemRetriever/interfaces/ISPListContext';
import { ISPListRow } from '../spListItemRetriever/interfaces/ISPGetItemResponse';
import { ISPListGroup } from './ISPListItemData';
import DriveSpaceHelper from '@ms/odsp-utilities/lib/string/DriveSpaceHelper';

export namespace GroupBuilder {
    export function buildCollapsedGroups(groupsFromServer: any[], listContext: ISPListContext, groupBy?: string[]):  { groups: ISPListGroup[], totalCount: number } {
        let groups = [];
        let totalChildCount = 0;
        let lastGroup0 = undefined;
        let lastGroup1 = undefined;

        groupBy = groupBy || listContext.groupBy;
        let groupField0 = groupBy[0];
        let groupField1 = groupBy[1];

        for (let groupFromServer of groupsFromServer) {
            if (groupField0) {
                if (groupFromServer[groupField0 + '.newgroup'] === '1') {
                    let newGroup = buildGroup(listContext, groupFromServer, groupField0, 0, true /*isCollapsed*/, totalChildCount);
                    groups.push(newGroup);
                    totalChildCount += newGroup.count;
                    lastGroup0 = newGroup;
                    lastGroup1 = undefined;
                }
            }

            if (groupField1) {
                if (groupFromServer[groupField1 + '.newgroup'] === '1') {
                    let startIndex = lastGroup1 ? lastGroup1.startIndex + lastGroup1.count :
                        (lastGroup0 ? lastGroup0.startIndex : 0);
                    lastGroup1 = buildGroup(listContext, groupFromServer, groupField1, 1, true /*isCollapsed*/, startIndex, lastGroup0);
                }
            }
        }

        return { groups: groups, totalCount: totalChildCount };
    }

    export function buildGroupFromItem(itemFromServer: ISPListRow, groups: ISPListGroup[], listContext: ISPListContext, groupBy?: string[]) {
        groupBy = groupBy || listContext.groupBy;
        if (groupBy && groupBy.length > 0) {
            let lastGroup0 = (groups && groups.length > 0) ? groups[groups.length - 1] : undefined;
            let groupField0 = groupBy[0];
            let groupField1 = groupBy[1];
            if (groupField0) {
                if (itemFromServer[groupField0 + '.newgroup'] === '1') {
                    let startIndex = lastGroup0 ? lastGroup0.startIndex + lastGroup0.count : 0;
                    let newGroup = buildGroup(listContext, itemFromServer, groupField0, 0, false /*isCollapsed*/, startIndex);
                    if (!groups) {
                        groups = [];
                    }
                    groups.push(newGroup);
                    lastGroup0 = newGroup;
                }
            }
            if (groupField1) {
                if (itemFromServer[groupField1 + '.newgroup'] === '1') {
                    let lastGroup1 = lastGroup0 && lastGroup0.children && lastGroup0.children.length > 0 ? lastGroup0.children[lastGroup0.children.length - 1] : undefined;
                    let startIndex = lastGroup1 ? lastGroup1.startIndex + lastGroup1.count :
                        (lastGroup0 ? lastGroup0.startIndex : 0);
                    buildGroup(listContext, itemFromServer, groupField1, 1, false /*isCollapsed*/, startIndex, lastGroup0);
                }
            }
        }
    }

    export function buildGroup(listContext: ISPListContext,
        groupFromServer: any,
        groupField: string,
        level: number,
        isCollapsed: boolean,
        startIndex: number,
        parent?: ISPListGroup): ISPListGroup {

        let groupSchemaMap = listContext.groupSchema;
        let fieldSchema = groupSchemaMap[groupField];
        let groupCountAttr = (level === 0) ? groupField + '.COUNT.group' : groupField + '.COUNT.group2';
        let groupType = fieldSchema ? fieldSchema.Type : undefined;
        let groupName = _getGroupName(groupFromServer, groupField, groupType);
        let groupString = _getGroupString(groupFromServer, groupField);
        let groupDisplay = _getGroupDisplay(groupFromServer, groupField, groupType);
        let fieldValue = _getGroupData(groupFromServer, groupField, groupName, groupType);

        let newGroup: ISPListGroup = {
            groupingType: 'SPListGroup',
            groupingId: (parent ? parent.groupingId + '-' : '') + (groupName || '(null)'),
            name: groupDisplay,
            groupString: groupString,
            fieldSchema: fieldSchema,
            fieldValue: fieldValue,
            count: Number(groupFromServer[groupCountAttr]),
            isCollapsed: isCollapsed,
            startIndex: startIndex,
            isDropEnabled: fieldSchema && fieldSchema.ReadOnly !== 'TRUE' && fieldValue !== undefined,
            parentKey: parent ? parent.groupingId : undefined,
            level: parent ? parent.level + 1 : 0
        };
        if (parent) {
            if (!parent.children) {
                parent.children = [];
            }
            parent.children.push(newGroup);
        }
        return newGroup;
    }

    function _getGroupString(itemFromServer: any, groupField: string): string {
        return itemFromServer[groupField + '.urlencoded'];
    }

    function _getGroupName(itemFromServer: any, groupField: string, groupType: string): string {
        let groupName = undefined;
        if (itemFromServer.hasOwnProperty(groupField + '.urlencoded')) {
            groupName = decodeURIComponent(itemFromServer[groupField + '.urlencoded']);
            let arrNames = groupName.split(';#');
            if (arrNames.length >= 2) {
                groupName = arrNames[arrNames.length - 2]; // pick the last but one entry; the last entry is always ''
            }
            if (groupType === 'DateTime') {
                groupName = groupName.split(' ')[0]; // for DateTime, keep only the date part and discard the time
            }
        } else if (groupField === 'FileSizeDisplay' && itemFromServer.hasOwnProperty('File_x0020_Size')) {
            groupName = itemFromServer.File_x0020_Size;
        }
        return groupName;
    }

    /* tslint:disable: no-string-literal */
    function _getGroupDisplay(itemFromServer: any, groupField: string, groupType: string): string {
        let groupDisplay = undefined;

        if (typeof (itemFromServer[groupField + '.groupdisp']) === 'string' &&
            // VSO 313853: for DateTime type, ensure groupdisp is not an empty string
            (groupType !== 'DateTime' || Boolean(itemFromServer[groupField + '.groupdisp']))) {
            groupDisplay = itemFromServer[groupField + '.groupdisp'];
        } else if (groupField === 'FileSizeDisplay' && itemFromServer.hasOwnProperty('File_x0020_Size')) {
            groupDisplay = DriveSpaceHelper.getDisplayString(Number(itemFromServer['File_x0020_Size']), { ignoreZero: true });
        } else if (itemFromServer.hasOwnProperty(groupField)) {
            switch (groupType) {
                case 'User':
                    let user = itemFromServer[groupField];
                    if (user && user.length > 0) {
                        groupDisplay = user[0]['title'];
                    }
                    break;
                case 'Lookup':
                    let lookup = itemFromServer[groupField];
                    if (lookup) {
                        if (lookup.Label && lookup.TermID) { // Managed MetaData (MMD)
                            groupDisplay = lookup.Label;
                        } else if (lookup.length > 0) {
                            groupDisplay = lookup[0]['lookupValue'];
                        }
                    }
                    break;
                case 'Boolean':
                case 'ModStat':
                case 'Number': // fix AverageRating display
                case 'Currency':
                case 'Text':
                case 'DateTime': // VSO 340352
                    groupDisplay = itemFromServer[groupField];
                    break;
                default:
                    break;
            }
        }

        if (typeof (groupDisplay) !== 'string') {
            groupDisplay = _getGroupName(itemFromServer, groupField, groupType);
        }

        return groupDisplay;
    }

    function _getGroupData(groupFromServer: any, groupField: string, groupName: string, groupType: string): string {
        let data = undefined;
        switch (groupType) {
            case 'Lookup':
                let lookup = groupFromServer[groupField];
                if (lookup) {
                    if (lookup.Label && lookup.TermID) { // Managed MetaData (MMD)
                        data = lookup.Label + '|' + lookup.TermID;
                    } else if (lookup.length > 0) {
                        data = String(lookup[0]['lookupId']);
                    }
                }
                break;
            case 'Boolean':
                data = groupFromServer[groupField + '.value'];
                break;
            case 'User':
                let user = groupFromServer[groupField];
                if (user && user.length > 0) {
                    let userEmail = user[0]['email'];
                    data = JSON.stringify([{ Key: userEmail, IsResolved: false }]);
                }
                break;
            default:
                data = groupName;
                break;
        }
        return data;
    }
    /* tslint:enable: no-string-literal */
}