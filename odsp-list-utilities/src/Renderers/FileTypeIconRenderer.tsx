// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { css } from 'office-ui-fabric-react/lib/Utilities';

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

export function FileTypeIconRenderer(props: IFileTypeIconRendererProps): JSX.Element {
    const { width, iconUrl, iconTitle, overlayUrl, isDisabled, tooltipText, isClickable, onClick, ariaLabel = iconTitle } = props;

    const iconStyle = {
        width: width,
        height: width
    };

    // use special styling if the item is disabled
    const hoverText = tooltipText ? iconTitle + '\n' + tooltipText : iconTitle;
    const image = <img
        className={ css('FileTypeIcon-icon', {
            'od-FieldRenderer--disabled': isDisabled
        }) }
        title={ overlayUrl ? null : iconTitle }
        src={ iconUrl }
        style={ iconStyle }
    />;

    if (overlayUrl) {
        let overlayImg = <img className={ css('FileTypeIcon-overlay', {
            'od-FieldRenderer--disabled': isDisabled
        }) } src={ overlayUrl } />;

        return (
            <div
                className={ css('FileTypeIcon', {
                    'FileTypeIcon--clickable': isClickable
                }) }
                data-is-focusable={ !!isClickable || !!onClick }
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
