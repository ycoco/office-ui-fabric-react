// OneDrive:IgnoreCodeCoverage

/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { IFieldRenderer, IFieldRendererProps } from './IFieldRenderer';
import { ISPListItem } from '@ms/odsp-datasources/lib/dataSources/item/spListItemProcessor/ISPListItemData';
import { UploadState } from '@ms/odsp-datasources/lib/dataSources/item/spListItemProcessor/IItemUploadState';
import { PolicyTipType } from '@ms/odsp-datasources/lib/dataSources/item/spListItemProcessor/SPListItemEnums';
import * as IconHelper  from '@ms/odsp-utilities/lib/icons/IconHelper';
import * as IconSelector from '@ms/odsp-utilities/lib/icons/IconSelector';

// import '../../../../fileTypeIcon/FileTypeIcon.css';
// import '../ReactDetailsList.css';

// These values (except None) correspond to overlay file names in odsp-media.
export enum OverlayType {
    none,
    checkOut,
    notify,
    block
}

export interface IFileTypeIconRendererProps extends IFieldRendererProps {
    onClick: (ev: React.MouseEvent<HTMLDivElement>) => void;

    /** Function that this renderer will use to get the URL of the overlay */
    getOverlayUrl: (overlayType: OverlayType) => string;

    mediaBaseUrl?: string;
    isRetinaSupported?: boolean;
}

export function FileTypeIconRenderer(props: IFileTypeIconRendererProps) {
    'use strict';

    let { item, column, onClick, getOverlayUrl, mediaBaseUrl, isRetinaSupported } = props;

    if (item) {
        let iconName = (item.state.upload.status === UploadState.failed) ? IconSelector.genericFile : item.iconName;
        let width = column.minWidth || column.width;
        let iconUrl = item.iconUrl || (item.fileHandler && item.fileHandler.icon) || IconHelper.getIconUrl(iconName, width, mediaBaseUrl, isRetinaSupported);
        let iconTitle = item.properties.iconFieldAriaLabel;
        let iconStyle = {
            width: width,
            height: width
        };
        let overlayType = _getOverlayType(item);
        let overlayUrl: string;

        if (overlayType !== OverlayType.none) {
            if (mediaBaseUrl !== undefined) {
                overlayUrl = getOverlayUrl(overlayType);
            }
        }

        // use special styling if the item is disabled
        let imageClass = item.properties.isDisabled ? 'FileTypeIcon-icon od-FieldRenderer--disabled' : 'FileTypeIcon-icon';
        let overlayImgClass = item.properties.isDisabled ? 'FileTypeIcon-overlay od-FieldRenderer--disabled' : 'FileTypeIcon-overlay';
        let hoverText = _getHoverText(item);
        let image = <img className={ imageClass } title={ overlayUrl ? null : iconTitle } src={ iconUrl } style={ iconStyle } />;
        let overlayImg = <img className={ overlayImgClass } src={ overlayUrl } />;
        /* tslint:disable-next-line:no-bitwise */
        let fileTypeIconClassName = item.policyTip & PolicyTipType.notify ? 'FileTypeIcon FileTypeIcon--clickable' : 'FileTypeIcon';
        let ariaLabel = item.properties.iconFieldAriaLabel;

        return (
            (overlayUrl) ? (
                <span
                    className={ fileTypeIconClassName }
                    title={ hoverText ? iconTitle + '\n' + hoverText : iconTitle }
                    aria-label = { ariaLabel }
                    onClick = { onClick }
                >
                    { image }
                    { overlayImg }
                </span>) : (image)
        );
    } else {
        return null;
    }
}

function _getOverlayType(item: ISPListItem): OverlayType {
    'use strict';

    let overlayType = OverlayType.none;
    if (item.policyTip) {
        // Use the block icon if the item's policy is block or notifyAndBlock.
        /* tslint:disable-next-line:no-bitwise */
        overlayType = item.policyTip & PolicyTipType.block ? OverlayType.block : OverlayType.notify;
    } else if (item.isViolation) {
        overlayType = OverlayType.block;
    } else if (item.properties.CheckedOutUserId) {
        overlayType = OverlayType.checkOut;
    } else if (item.state.upload.status === UploadState.failed) {
        overlayType = OverlayType.notify;
    }

    return overlayType;
}

function _getHoverText(item: ISPListItem): string {
    if (item.tooltipText) {
        return item.tooltipText;
    }
    return null;
}

// Typecheck to make sure this renderer conforms to IFieldRenderer.
// If this renderer does not, then the next line will fail to compile.
/* tslint:disable-next-line:no-unused-variable */
const typecheck: IFieldRenderer<IFileTypeIconRendererProps> = FileTypeIconRenderer;
