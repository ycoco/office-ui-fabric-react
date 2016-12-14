/* tslint:disable-next-line:no-unused-variable */
import * as React from 'react';

import {
    ISPListColumn,
    ISPListItem
} from '@ms/odsp-datasources/lib/dataSources/item/spListItemProcessor/ISPListItemData';

import { getCellText } from './BaseText';
import './DateRenderer.scss';
import { format } from '@ms/odsp-utilities/lib/string/StringHelper';

const MODIFIED_KEY = 'dateModified';
const ONE_HOUR = 3600000; // 3600000 milliseconds is 1 hour
const HEAVY_ASTERISK = '\u2731';

export interface IDateRendererProps extends React.HTMLProps<HTMLDivElement> {
    item: ISPListItem;
    index: number;
    column: ISPListColumn;
    strings: {
        cellAriaLabel: string;
    };
}

export function DateRenderer(props: IDateRendererProps) {
    'use strict';
    let { item, index, column, strings } = props;

    let dateValue = null;
    let isIndicatorVisible = false;
    let text = getCellText(item, column);

    // Check if item.dataModifiedValue or dateDeleted exist.
    if (item.dateModifiedValue) {
        dateValue = item.dateModifiedValue;
    } else if (item.dateDeleted) {
        dateValue = item.dateDeleted;
    }

    // Adds a heavy asterisk if dateValue exist, and modifiedTime less than one hour.
    if (dateValue && (column.key === MODIFIED_KEY)) {
        let modifiedTime = new Date(dateValue).getTime();

        if (modifiedTime && Math.abs(Date.now() - modifiedTime) <= ONE_HOUR) {
            isIndicatorVisible = true;
        }
    }

    // add special styling if item is disabled
    let dateClass = item.properties.isDisabled ? 'od-FieldRenderer--disabled' : '';

    return (
        <div data-is-focusable={ true } aria-label={ format(strings.cellAriaLabel, column.name, text) } className={ dateClass }>
            { isIndicatorVisible && (
                <span className='od-DateField--newItem'>{ HEAVY_ASTERISK }</span>
            ) }
            { text }
        </div>
    );
}