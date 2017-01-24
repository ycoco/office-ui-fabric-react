// OneDrive:IgnoreCodeCoverage

/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

// import '../ReactDetailsList.css';

export interface IBaseTextProps extends React.HTMLProps<HTMLDivElement> {
    /** Text to render */
    text: string;

    /** Apply special styling if an item is diabled */
    isDisabled?: boolean;

    /** If set, no text is rendered */
    noTextRender?: boolean;

    /** Text to put in aria-label. If not specified, defaults to rendered text */
    ariaLabel?: string;

    /** Text for the title property, which determines the tooltip text. */
    title?: string;
}

export function BaseText(props: IBaseTextProps) {
    'use strict';

    let { text, isDisabled, noTextRender, ariaLabel, title, children } = props;
    text = text || ' ';
    ariaLabel = ariaLabel || text;    // Default to text if no ariaLabel given

    // apply special styling if item is disabled
    let baseTextClass = '';
    if (isDisabled) {
        baseTextClass = 'od-FieldRenderer--disabled';
    }

    return (
        <div data-is-focusable={ true } aria-label={ ariaLabel } className={ baseTextClass } title={ title }>
          { noTextRender ? null : text }
          { children }
        </div>
    );
}