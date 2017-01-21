/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { BaseText } from './BaseText';
import Sanitize from '@ms/odsp-utilities/lib/encoding/Sanitize';
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

        // If we are using dangerouslySetInnerHTML, use only the text content for the title.
        // Otherwise, the tooltip will include any HTML tags.
        let textContent = '';
        if (text) {
            textContent = Sanitize.getTextFromHtml(text);
        }

        return (
            <div className={ textClass } data-is-focusable={ true } aria-label={ ariaLabel } title={ textContent } dangerouslySetInnerHTML={ { __html: text } } />
        );
    } else {
        return (
            <BaseText text={ text } isDisabled={ isDisabled } ariaLabel={ ariaLabel } title={ text }/>
        );
    }
}
