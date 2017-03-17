import { ISPListItem } from '../../SPListItemProcessor';
import PermissionMask from '../permissions/PermissionMask';

export class WopiHelper {

    public static AddWopiPerfMark(clickOrig: Number, clickTime: Number): void {
        try {
            if ('sessionStorage' in window && window.sessionStorage) {
              // tslint:disable:no-string-literal
              window.sessionStorage['WOPIPerf_UserClickTime'] = clickTime;
              window.sessionStorage['WOPIPerf_UserClickOrigin'] = clickOrig;
              // tslint:enable:no-string-literal
            }
        } catch (e) {
            // sessionStorage errors
            // DO Nothing
        }
    }

    public static GetWopiFrameEditUrl(item: ISPListItem): string {
        // Checking if there's an associated WAC URL, from the server as serverurl.progid, before
        // constructing the URL to open in the WAC.
        // tslint:disable-next-line:no-string-literal
        if (!!item.properties['serverurl.progid'] && item.properties['serverurl.progid'] !== '') {
            const editActionString: string = 'action=edit';
            const interactivePreviewActionString: string = 'action=interactivepreview';
            let wacUrl: string = item.properties.ServerRedirectedEmbedUrl;
            if (wacUrl && item.appMap !== 'ms-visio' &&
                PermissionMask.hasItemPermission(item, PermissionMask.editListItems)) {
                wacUrl = wacUrl.replace(interactivePreviewActionString, editActionString);
            }
            return wacUrl;
        } else {
            // Returns an empty string if the item does not have a WAC URL.
            return '';
        }
    }
}

export default WopiHelper;
