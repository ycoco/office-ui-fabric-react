/**
 * Static helper methods used by the ItemProvider.
 */

import {
    ISPListProcessedData,
    ISPListGroup
} from '../../SPListItemProcessor';
import {
    ISPGetItemContext
} from '../../SPListItemRetriever';
import { ISPItemSet } from './ISPItemSet';

export const NEXT_GROUP_ID: string = '__next__';
export const NEXT_GROUP_START_INDEX: number = -2;

export function getKey(context: ISPGetItemContext): string {
    let result: string = '';
    result += 'parentKey=' + context.parentKey;
    result += '&sortField=' + (context.sortField || '');
    result += '&isAscending=' + (typeof context.isAscending === 'boolean' ? context.isAscending : '');

    if (context.filters) {
        for (const filterKey in context.filters) {
            if (filterKey) {
                result += '&' + filterKey + '=' + context.filters[filterKey];
            }
        }
    }

    if (context.groupBy) {
        result += '&groupBy=' + context.groupBy;
    }

    if (context.baseViewId) {
        result += '&viewId=' + context.baseViewId;
    }
    // View XML is used when adhoc modifications have been made to certain view properties.
    // The XML is used for field modifications or smart filters.
    // In order to support both case, for now, we use the whole viewXml string as part of the key.
    if (context.viewXml) {
        result += '&viewXml=' + context.viewXml;
    }

    return result;
}

export function resultSetHasData(itemKeys: string[], startIndex: number, endIndex: number): boolean {
    const length: number = itemKeys.length;

    let result: boolean = true;

    for (let i: number = startIndex; i < endIndex && i < length; i++) {
        if (!itemKeys[i]) {
            result = false;
            break;
        }
    }

    return result;
}

export function mergeItemSets(itemSet: ISPItemSet, result: ISPListProcessedData, updateSchema: boolean): ISPItemSet {
    const newItemSet: ISPItemSet = itemSet;

    // update columns
    if (result.columns && updateSchema) {
        newItemSet.columns = result.columns;
    }

    // merge items array
    let lastItemIndex = 0;
    if (result.items && result.items.length > 0) {
        const allItemKeys: string[] = itemSet.itemKeys;
        for (let itemIndex: number = result.startIndex, i: number = 0; i < result.items.length; itemIndex++, i++) {
            allItemKeys[itemIndex] = result.items[i].key;
            lastItemIndex = itemIndex;
        }
        newItemSet.itemKeys = allItemKeys;
    }

    // merge groups
    const newGroups: ISPListGroup[] = computeGroups(itemSet.groups,
        result.groups,
        Boolean(result.nextRequestToken),
        itemSet.isAllGroupsCollapsed); // try to retain the collapse/expand state in the cached itemset
    newItemSet.groups = newGroups;

    if (lastItemIndex >= newItemSet.totalCount) {
        newItemSet.totalCount = lastItemIndex > 0 ? lastItemIndex + 1 : lastItemIndex;
    }

    if (result.nextRequestToken) {
        newItemSet.nextRequestToken = result.nextRequestToken;
    }

    return newItemSet;
}

export function removeNextGroup(groups: ISPListGroup[]): void {
    // remove the placeholder 'next' group if one exists
    if (groups && groups.length > 0) {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup.isPlaceholder && lastGroup.groupingId === NEXT_GROUP_ID) {
            groups.pop();
        }
    }
}

export function addNextGroup(groups: ISPListGroup[], isCollapsed: boolean): void {
    // add the placeholder 'next' group if doesn't exist
    if (groups && groups.length > 0) {
        const lastGroup = groups[groups.length - 1];
        const isNextGroup = lastGroup.isPlaceholder && lastGroup.groupingId === NEXT_GROUP_ID;
        if (!isNextGroup) {
            const nextGroup = {
                groupingId: NEXT_GROUP_ID,
                startIndex: NEXT_GROUP_START_INDEX,
                count: 1,
                isPlaceholder: true,
                isCollapsed: isCollapsed
            };
            groups.push(nextGroup);
        }
    }
}

function computeGroups(oldGroups: ISPListGroup[], newGroups: ISPListGroup[], hasMoreItems: boolean, isAllCollapsed: boolean): ISPListGroup[] {
    // remove dummy next group if any
    removeNextGroup(oldGroups);

    // merge with new grouping information
    const groups: ISPListGroup[] = mergeGroups(oldGroups, newGroups, isAllCollapsed);

    return groups;
}

function mergeGroups(oldGroups: ISPListGroup[],
    newGroups: ISPListGroup[],
    isAllCollapsed: boolean,
    parentGroup?: ISPListGroup): ISPListGroup[] {
    let groups: ISPListGroup[] = oldGroups;

    if (oldGroups && oldGroups.length > 0) {
        if (newGroups && newGroups.length > 0) {
            // both old and new present: merge item groups
            for (const newGroup of newGroups) {
                let foundMatch: boolean = false;
                if (isAllCollapsed) {
                    newGroup.isCollapsed = true;
                }
                for (let idx: number = 0; idx < groups.length; idx++) {
                    const existingGroup: ISPListGroup = groups[idx];
                    if (newGroup.groupingId === existingGroup.groupingId) {
                        // update existing group to new values
                        existingGroup.count = newGroup.count;
                        existingGroup.children = mergeGroups(existingGroup.children,
                          newGroup.children,
                          isAllCollapsed,
                          existingGroup);
                        if (idx === 0) {
                            existingGroup.startIndex = parentGroup ? parentGroup.startIndex : 0;
                        } else {
                            const prevGroup: ISPListGroup = groups[idx - 1];
                            const deltaStartIndex: number = prevGroup.startIndex + prevGroup.count - existingGroup.startIndex;
                            existingGroup.startIndex += deltaStartIndex;
                            if (existingGroup.children) {
                                existingGroup.children.forEach((group: ISPListGroup) => {
                                    group.startIndex += deltaStartIndex;
                                });
                            }
                        }
                        foundMatch = true;
                        break;
                    }
                }
                if (!foundMatch) {
                    const lastGroup: ISPListGroup = groups[groups.length - 1];
                    const deltaStartIndex: number = lastGroup.startIndex + lastGroup.count - newGroup.startIndex;
                    newGroup.startIndex += deltaStartIndex;
                    if (newGroup.children) {
                        newGroup.children.forEach((group: ISPListGroup) => {
                            group.startIndex += deltaStartIndex;
                        });
                    }
                    groups.push(newGroup);
                }
            }
        }
        // else new is empty; just return old
    } else {
        groups = newGroups; // old is empty; just return new
    }

    return groups;
}
