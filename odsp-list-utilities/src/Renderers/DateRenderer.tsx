import * as React from 'react';
import {
    css
} from 'office-ui-fabric-react/lib/Utilities';

import './DateRenderer.scss';

const ONE_HOUR = 3600000; // 3600000 milliseconds is 1 hour
const HEAVY_ASTERISK = '\u2731';

export interface IDateRendererProps {
    text: string;
    dateValue?: string;
    indicatorEnabled?: boolean; // If true, can possibly output a HEAVY_ASTERISK indicator
    isDisabled?: boolean;
    ariaLabel?: string;
}

export function DateRenderer(props: IDateRendererProps): JSX.Element {
    let { text, dateValue, indicatorEnabled, isDisabled, ariaLabel } = props;
    ariaLabel = ariaLabel || text; // Default to text if no ariaLabel given

    let isIndicatorVisible = false;

    // Adds a heavy asterisk if dateValue exist, and modifiedTime less than one hour.
    if (dateValue && indicatorEnabled) {
        let modifiedTime = new Date(dateValue).getTime();

        if (modifiedTime && Math.abs(Date.now() - modifiedTime) <= ONE_HOUR) {
            isIndicatorVisible = true;
        }
    }

    return (
        <div
            className={ css('od-FieldRenderer-date', {
                'od-FieldRenderer--disabled': isDisabled
            }) }>
            { isIndicatorVisible && (
                <span className='od-DateField--newItem'>{ HEAVY_ASTERISK }</span>
            ) }
            { text }
        </div>
    );
}
