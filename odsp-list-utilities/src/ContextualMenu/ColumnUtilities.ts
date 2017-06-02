import { ColumnFieldType } from '@ms/odsp-datasources/lib/SPListItemProcessor';

const LAST_MODIFIED_FIELD = 'Last_x0020_Modified';
const CREATED_DATE_FIELD = 'Created_x0020_Date';

export interface ISortMenuStrings {
    columnMenuSortAscendingDate: string;
    columnMenuSortDescendingDate: string;
    columnMenuSortAscendingNumber: string;
    columnMenuSortDescendingNumber: string;
    columnMenuSortAscendingText: string;
    columnMenuSortDescendingText: string;
    columnMenuSortAscendingBoolean: string;
    columnMenuSortDescendingBoolean: string;
    columnMenuSortAscendingAttachments: string;
    columnMenuSortDescendingAttachments: string;
    columnMenuSortAscending: string;
    columnMenuSortDescending: string;
}

/**
 * Returns the appropriate sort string for the given column
 *
 * @returns {string, string} the ascending and descending sort strings
 */
export function getSortMenuStrings(column: {
        fieldType?: ColumnFieldType,
        internalName?: string
    }, strings: ISortMenuStrings): {ascendingString: string, descendingString: string} {
    'use strict';

    let ascending = '';
    let descending = '';

    switch (column.fieldType) {
        case ColumnFieldType.DateTime:
            ascending = strings.columnMenuSortAscendingDate;
            descending = strings.columnMenuSortDescendingDate;
            break;

        case ColumnFieldType.Number:
        case ColumnFieldType.Currency:
        case ColumnFieldType.Counter:
        case ColumnFieldType.FileSize:
        case ColumnFieldType.Ratings:
        case ColumnFieldType.AverageRating:
        case ColumnFieldType.Likes:
            ascending = strings.columnMenuSortAscendingNumber;
            descending = strings.columnMenuSortDescendingNumber;
            break;

        case ColumnFieldType.Text:
        case ColumnFieldType.Name:
        case ColumnFieldType.Title:
        case ColumnFieldType.Note:
        case ColumnFieldType.Taxonomy:
        case ColumnFieldType.User:
            ascending = strings.columnMenuSortAscendingText;
            descending = strings.columnMenuSortDescendingText;
            break;

        case ColumnFieldType.Boolean:
        case ColumnFieldType.ComplianceRecordFlag:
            ascending = strings.columnMenuSortAscendingBoolean;
            descending = strings.columnMenuSortDescendingBoolean;
            break;

        case ColumnFieldType.Lookup:
            if (column.internalName === LAST_MODIFIED_FIELD ||
                column.internalName === CREATED_DATE_FIELD) {
                ascending = strings.columnMenuSortAscendingDate;
                descending = strings.columnMenuSortDescendingDate;
            } else {
                // generic lookup
                ascending = strings.columnMenuSortAscending;
                descending = strings.columnMenuSortDescending;
            }
            break;

        case ColumnFieldType.Attachments:
            ascending = strings.columnMenuSortAscendingAttachments;
            descending = strings.columnMenuSortDescendingAttachments;
            break;

        // generic sort
        default:
            ascending = strings.columnMenuSortAscending;
            descending = strings.columnMenuSortDescending;
            break;
    }

    return { ascendingString: ascending, descendingString: descending };
}