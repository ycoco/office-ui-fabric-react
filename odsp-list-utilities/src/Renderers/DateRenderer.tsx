import * as React from 'react';

import './DateRenderer.scss';

const ONE_HOUR = 3600000; // 3600000 milliseconds is 1 hour
const HEAVY_ASTERISK = '\u2731';

export interface IDateRendererProps {
    text: string;
    dateValue?: string;
    indicatorEnabled?: boolean;  // If true, can possibly output a HEAVY_ASTERISK indicator
    isDisabled?: boolean;
    ariaLabel?: string;
}

export function DateRenderer(props: IDateRendererProps): JSX.Element {
    'use strict';
    let { text, dateValue, indicatorEnabled, isDisabled, ariaLabel } = props;
    ariaLabel = ariaLabel || text;    // Default to text if no ariaLabel given

    let isIndicatorVisible = false;

    // Adds a heavy asterisk if dateValue exist, and modifiedTime less than one hour.
    if (dateValue && indicatorEnabled) {
        let modifiedTime = new Date(dateValue).getTime();

        if (modifiedTime && Math.abs(Date.now() - modifiedTime) <= ONE_HOUR) {
            isIndicatorVisible = true;
        }
    }

    // add special styling if item is disabled
    let dateClass = isDisabled ? 'od-FieldRenderer--disabled' : '';

    return (
        <div
            className={ dateClass }>
            { isIndicatorVisible && (
                <span className='od-DateField--newItem'>{ HEAVY_ASTERISK }</span>
            ) }
            { text }
        </div>
    );
}
