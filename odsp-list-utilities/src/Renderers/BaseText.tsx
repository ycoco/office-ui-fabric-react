// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import {
    css
} from 'office-ui-fabric-react/lib/Utilities';

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

export function BaseText(props: IBaseTextProps): JSX.Element {
    let { text, isDisabled, noTextRender, ariaLabel, title, children } = props;
    text = text || ' ';
    ariaLabel = ariaLabel || text;    // Default to text if no ariaLabel given

    return (
        <div
            aria-label={ noTextRender ? ariaLabel : undefined }
            className={ css(props.className, {
                'od-FieldRenderer--disabled': isDisabled
            }) }
        >
            { noTextRender ? null : (<span>{ text }</span>) }
            { children }
        </div>
    );
}
