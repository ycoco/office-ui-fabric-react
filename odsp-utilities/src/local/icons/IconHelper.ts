// OneDrive:IgnoreCodeCoverage

import * as StringHelper from '../string/StringHelper';
import * as IconSelector from './IconSelector';
import FileTypeIconMap from './FileTypeIconMap';

const DEFAULT_MEDIA_BASE_URL = 'odsp-media';

export function getIconUrl(
    iconName: string,
    size: number,
    mediaBaseUrl: string = DEFAULT_MEDIA_BASE_URL,
    isRetinaSupported: boolean = false
    ): string {
    "use strict";

    // We don't have retina icons for sizes above 48...
    isRetinaSupported = isRetinaSupported && (size <= 48);

    var iconUrl = '';

    if (mediaBaseUrl) {
        let extension = FileTypeIconMap[iconName] && FileTypeIconMap[iconName].iconType || 'png';
        iconUrl = require.toUrl(StringHelper.format(
            "{0}/images/filetypes/{1}{2}/{3}.{4}",
            mediaBaseUrl,
            size,
            isRetinaSupported ? '_2x' : '',
            iconName,
            extension));
    }

    return iconUrl;
}

export function getIconUrlFromExtension(iconExtension: string, size: number, mediaBaseUrl?: string, isRetinaSupported?: boolean): string {
    "use strict";

    let iconName = IconSelector.getIconNameFromExtension(iconExtension);
    return getIconUrl(iconName, size, mediaBaseUrl, isRetinaSupported);
}