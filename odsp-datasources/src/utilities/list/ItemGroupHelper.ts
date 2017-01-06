import { ISPListGroup } from '../../dataSources/item/spListItemProcessor/ISPListItemData';

module ItemGroupHelper {
    // To keep the logic simple, currently this works for 2-level nested groups only,
    // as the product only supports 2-level nesting. If needed, extend this to work for arbitrary level groups
    export function getParent(group: ISPListGroup, itemGroups: ISPListGroup[]): ISPListGroup {
        if (!group.level || !group.parentKey || group.level === 0) {
            return undefined;
        }
        let matchingGroups = itemGroups.filter((itemGroup: ISPListGroup) => {
            return itemGroup.groupingId === group.parentKey;
        });
        return matchingGroups[0];
    }

    export function getFilterDetails(group: ISPListGroup, itemGroups: ISPListGroup[]): { fields: string[], values: string[] } {
        let thisGroup = group;
        let filterFields = [];
        let filterValues = [];
        while (thisGroup && thisGroup.fieldSchema) {
            filterFields.unshift(thisGroup.fieldSchema.Name);

            let filterValue = _getFilterValue(thisGroup);
            filterValues.unshift(filterValue);

            thisGroup = ItemGroupHelper.getParent(thisGroup, itemGroups);
        }
        return { fields: filterFields, values: filterValues };
    }

    function _getFilterValue(group: ISPListGroup) {
        let filterValue = '';
        switch (group.fieldSchema.Type) {
            case 'User':
            case 'Lookup':
                filterValue = group.name;
                break;
            case 'DateTime':
                let groupStringParts = decodeURIComponent(group.groupString).split(';#');
                let dateTimeString = groupStringParts[0];
                if (groupStringParts.length > 0) { // nested groups
                    groupStringParts = groupStringParts.slice(1, groupStringParts.length - 1); // ignore empty first and last items
                    if (groupStringParts[group.level]) {
                        dateTimeString = groupStringParts[group.level]; // pick the string for the right level
                    }
                }
                filterValue = _getDateFromGroupString(dateTimeString);
                break;
            default:
                filterValue = group.fieldValue;
                break;
        }
        return filterValue;
    }

    function _getDateFromGroupString(dateTime: string): string {
        let year = dateTime.substring(0, 4);
        let month = dateTime.substring(4, 6);
        let date = dateTime.substring(6, 8);
        return [ year, '-', month, '-', date ].join('');
    }
}

export default ItemGroupHelper;