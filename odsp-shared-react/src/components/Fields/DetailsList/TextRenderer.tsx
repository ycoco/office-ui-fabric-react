/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { BaseText } from './BaseText';
// import '../ReactDetailsList.css';

export interface ITextRendererProps {
    text: string;
    isSafeToInnerHTML?: boolean;
    isDisabled?: boolean;
    ariaLabel?: string;
}

export function TextRenderer(props: ITextRendererProps) {
    'use strict';

    let { text, isSafeToInnerHTML, isDisabled, ariaLabel } = props;
    ariaLabel = ariaLabel || text;    // Default to text if no ariaLabel given

    if (isSafeToInnerHTML) {
        // apply special styling if item is disabled
        let textClass = 'od-FieldRenderer-text';
        if (isDisabled) {
            textClass += ' od-FieldRenderer--disabled';
        }

        return (
            <div className={ textClass } data-is-focusable={ true } aria-label={ ariaLabel } title={ text } dangerouslySetInnerHTML={ { __html: text } } />
        );
    } else {
        return (
            <BaseText text={ text } isDisabled={ isDisabled } ariaLabel={ ariaLabel } />
        );
    }
}
