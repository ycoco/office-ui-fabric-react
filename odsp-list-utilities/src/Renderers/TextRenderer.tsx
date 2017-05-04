import * as React from 'react';

import { BaseText } from './BaseText';
import Sanitize from '@ms/odsp-utilities/lib/encoding/Sanitize';
import './TextRenderer.scss';

export interface ITextRendererProps {
    /** Text to render */
    text: string;

    /** Text is safe to be used as inner HTML */
    isSafeToInnerHTML?: boolean;

    /** Apply special styling if an item is diabled */
    isDisabled?: boolean;

    /** aria label of the field. */
    ariaLabel?: string;

    /** Apply special styling if an item is truncated */
    isTruncated?: boolean;    
}

export function TextRenderer(props: ITextRendererProps) {
    'use strict';

    let { text, isSafeToInnerHTML, isDisabled, ariaLabel, isTruncated } = props;
    ariaLabel = ariaLabel || text;    // Default to text if no ariaLabel given

    if (isSafeToInnerHTML) {
        // apply special styling if item is disabled
        let textClass = 'od-FieldRenderer-text';
        if (isTruncated) {
            textClass += ' is-truncated';
        }
        if (isDisabled) {
            textClass += ' od-FieldRenderer--disabled';
        }

        // If we are using dangerouslySetInnerHTML, use only the text content for the title.
        // Otherwise, the tooltip will include any HTML tags.
        let textContent = '';
        if (text) {
            textContent = Sanitize.decodeHtmlEntities(text);
        }

        return (
            <div
                className={ textClass }
                dangerouslySetInnerHTML={ { __html: text } }
            />
        );
    } else {
        return (
            <BaseText
                text={ text }
                isDisabled={ isDisabled }
                ariaLabel={ ariaLabel }
                />
        );
    }
}
