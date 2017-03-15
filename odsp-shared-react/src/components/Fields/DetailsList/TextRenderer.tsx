import * as React from 'react';

import { BaseText } from './BaseText';
import Sanitize from '@ms/odsp-utilities/lib/encoding/Sanitize';
import HtmlEncoding from '@ms/odsp-utilities/lib/encoding/HtmlEncoding'

export interface ITextRendererProps {
    text: string;
    isSafeToInnerHTML?: boolean;
    isDisabled?: boolean;
    ariaLabel?: string;
    isNote?: boolean;
}

export function TextRenderer(props: ITextRendererProps) {
    'use strict';

    let { text, isSafeToInnerHTML, isDisabled, ariaLabel, isNote } = props;
    ariaLabel = ariaLabel || text;    // Default to text if no ariaLabel given

    if (isSafeToInnerHTML || isNote) {
        // apply special styling if item is disabled
        let textClass = 'od-FieldRenderer-text';
        if (isDisabled) {
            textClass += ' od-FieldRenderer--disabled';
        }

        // If we are using dangerouslySetInnerHTML, use only the text content for the title.
        // Otherwise, the tooltip will include any HTML tags.
        let textContent = '';
        if (isSafeToInnerHTML && text) {
            textContent = Sanitize.getTextFromHtml(text);
        } else if (isNote && text) {
            text = HtmlEncoding.encodeText(text);
            text = text.replace(/\n/g, '<br>');
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
