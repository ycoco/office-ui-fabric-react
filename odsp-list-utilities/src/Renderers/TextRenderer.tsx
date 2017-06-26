import * as React from 'react';
import { css } from 'office-ui-fabric-react/lib/Utilities';
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

export function TextRenderer(props: ITextRendererProps): JSX.Element {
    let { text, isSafeToInnerHTML, isDisabled, ariaLabel, isTruncated } = props;
    ariaLabel = ariaLabel || text;    // Default to text if no ariaLabel given

    if (isSafeToInnerHTML) {
        // If we are using dangerouslySetInnerHTML, use only the text content for the title.
        // Otherwise, the tooltip will include any HTML tags.
        const textContent = text && Sanitize.decodeHtmlEntities(text) || '';

        return (
            <div
                className={ css('od-FieldRenderer-text', {
                    'is-truncated': isTruncated,
                    'od-FieldRenderer--disabled': isDisabled
                }) }
                dangerouslySetInnerHTML={ { __html: text } }
            />
        );
    } else {
        return (
            <BaseText
                className='od-FieldRenderer-text'
                text={ text }
                isDisabled={ isDisabled }
                ariaLabel={ ariaLabel }
            />
        );
    }
}
