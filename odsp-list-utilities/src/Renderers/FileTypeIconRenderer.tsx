// OneDrive:IgnoreCodeCoverage

import * as React from 'react';

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

    const { width, iconUrl, iconTitle, overlayUrl, isDisabled, tooltipText, isClickable, onClick, ariaLabel = iconTitle } = props;

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
        let fileTypeIconClassName = isClickable ? 'FileTypeIcon FileTypeIcon--clickable' : 'FileTypeIcon';

        return (
            <div
                className={ fileTypeIconClassName }
                data-is-focusable={ true }
                title={ hoverText }
                aria-label={ ariaLabel }
                onClick={ onClick }
            >
                { image }
                { overlayImg }
            </div>
        );
    } else {
        return (
            <div
                className={ 'FileTypeIcon' }
                aria-label={ iconTitle }
            >
                { image }
            </div>
        );
    }
}
