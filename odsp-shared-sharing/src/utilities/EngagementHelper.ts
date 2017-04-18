import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import { IEngagementExtraData, ShareType, SharingAudience, ClientId, Mode } from '../interfaces/SharingInterfaces';

const ENGAGEMENT_PREFIX = 'ShareV3';

export function opened(extraData: IEngagementExtraData) {
    this._log('Opened', extraData);
}

export function linkSettingsOpened(extraData: IEngagementExtraData) {
    this._log('LinkSettings.Opened', extraData);
}

export function linkSettingsApplyClicked(extraData: IEngagementExtraData) {
    this._log('LinkSettings.ApplyClicked', extraData);
}

export function linkSettingsCancelClicked(extraData: IEngagementExtraData) {
    this._log('LinkSettings.CancelClicked', extraData);
}

export function manageAccessOpened(extraData: IEngagementExtraData) {
    this._log('ManageAccess.Opened', extraData);
}

export function shareCompleted(extraData: IEngagementExtraData) {
    this._log('Completed', extraData);
}

export function _log(eventName: string, extraData: IEngagementExtraData) {
    // Get string values of enums so charts are nicer.
    const friendlyExtraData = {
        ...extraData,
        clientId: ClientId[extraData.clientId],
        mode: Mode[extraData.mode],
        shareType: ShareType[extraData.shareType],
        audience: SharingAudience[extraData.audience]
    };

    const engagementPayload = {
        name: `${ENGAGEMENT_PREFIX}.${eventName}`,
        extraData: friendlyExtraData
    };

    Engagement.logData(engagementPayload);
}