// OneDrive:IgnoreCodeCoverage

/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

// import '../../../../fileTypeIcon/FileTypeIcon.css';
// import '../ReactDetailsList.css';

export interface IFileTypeIconRendererProps {
    iconName: string;
    width: number;
    iconUrl: string;
    iconTitle: string;
    overlayUrl?: string;
    isDisabled?: boolean;
    tooltipText?: string;
    ariaLabel?: string;
    isClickable?: boolean;
    onClick: (ev: React.MouseEvent<HTMLDivElement>) => void;
}

export function FileTypeIconRenderer(props: IFileTypeIconRendererProps) {
    'use strict';

    let { iconName, width, iconUrl, iconTitle, overlayUrl, isDisabled, tooltipText, ariaLabel, isClickable, onClick } = props;
    ariaLabel = ariaLabel || iconTitle;    // default to iconTitle if not specified

    let iconStyle = {
        width: width,
        height: width
    };

    // use special styling if the item is disabled
    let imageClass = isDisabled ? 'FileTypeIcon-icon od-FieldRenderer--disabled' : 'FileTypeIcon-icon';
    let hoverText = tooltipText ? iconTitle + '\n' + tooltipText : iconTitle;
    let image = <img className={ imageClass } title={ overlayUrl ? null : iconTitle } src={ iconUrl } style={ iconStyle } />;

    if (overlayUrl) {
        let overlayImgClass = isDisabled ? 'FileTypeIcon-overlay od-FieldRenderer--disabled' : 'FileTypeIcon-overlay';
        let overlayImg = <img className={ overlayImgClass } src={ overlayUrl } />;
        /* tslint:disable-next-line:no-bitwise */
        let fileTypeIconClassName = isClickable ? 'FileTypeIcon FileTypeIcon--clickable' : 'FileTypeIcon';

        return (
            <span
                className={ fileTypeIconClassName }
                title={ hoverText }
                aria-label = { ariaLabel }
                onClick = { onClick }
            >
                { image }
                { overlayImg }
            </span>
        );
    } else {
        return (
             image
        );
    }
}
