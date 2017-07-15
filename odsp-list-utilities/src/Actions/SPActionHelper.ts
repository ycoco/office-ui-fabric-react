import { ISPListItem } from '@ms/odsp-datasources/lib/SPListItemProcessor';
import * as CheckedOutHelper from './CheckedOutHelper';

/**
 * This logic was moved from ActionHelper in odsp-next
 */

export default class SPActionHelper {
    public static isCheckedOut(item: ISPListItem): boolean {
        return CheckedOutHelper.isCheckedOut(item);
    }

    public static isCheckedOutByUser(item: ISPListItem, userId: number | string): boolean {
        return CheckedOutHelper.isCheckedOutByUser(item, userId);
    }

    public static isCheckedOutByOther(item: ISPListItem, userId: number | string): boolean {
        return SPActionHelper.isCheckedOut(item) &&
            !SPActionHelper.isCheckedOutByUser(item, userId);
    }
}
