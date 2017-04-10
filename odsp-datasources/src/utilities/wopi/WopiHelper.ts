import { ISPListItem } from '../../SPListItemProcessor';
import PermissionMask from '../permissions/PermissionMask';
import { Killswitch } from '@ms/odsp-utilities/lib/killswitch/Killswitch';

export class WopiHelper {
    private static wopiUrlKillSwitchId = '95C4BD00-E9B8-4711-BCD3-E1B7A99A016B';
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
        if (item.properties['serverurl.progid']) {
            const editActionString: string = 'action=edit';
            if (!Killswitch.isActivated(WopiHelper.wopiUrlKillSwitchId)) {
                const defaultAction = 'action=default';
                const interactivePreviewActionString: string = 'action=interactivepreview';
                let wacUrl: string = item.properties.ServerRedirectedEmbedUrl;
                if (wacUrl && item.appMap !== 'ms-visio') {
                    if (PermissionMask.hasItemPermission(item, PermissionMask.editListItems)) {
                        wacUrl = wacUrl.replace(interactivePreviewActionString, editActionString);
                    } else {
                        wacUrl = wacUrl.replace(interactivePreviewActionString, defaultAction);
                    }
                }
                return wacUrl;
            } else {            
                const interactivePreviewActionString: string = 'action=interactivepreview';
                let wacUrl: string = item.properties.ServerRedirectedEmbedUrl;
                if (wacUrl && item.appMap !== 'ms-visio' &&
                    PermissionMask.hasItemPermission(item, PermissionMask.editListItems)) {
                    wacUrl = wacUrl.replace(interactivePreviewActionString, editActionString);
                }
                return wacUrl;
            }
        } else {
            // Returns an empty string if the item does not have a WAC URL.
            return '';
        }
    }
}

export default WopiHelper;
