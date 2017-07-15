/**
 * This logic was moved from CheckedOutHelper in odsp-next.
 */

export const CheckOutUserProperty: string = 'CheckedOutUserId';

export function isCheckedOut(item: { properties?: { CheckedOutUserId?: string }}): boolean {
    return !!item.properties[CheckOutUserProperty];
}

export function isCheckedOutByUser(item: { properties?: { CheckedOutUserId?: string }}, userId: number | string): boolean {
    let userIdNum = Number(userId);
    return !isNaN(userIdNum) && Number(item.properties[CheckOutUserProperty]) === userIdNum;
}
