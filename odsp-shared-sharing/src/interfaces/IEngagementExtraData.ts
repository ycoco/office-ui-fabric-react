import { ClientId, Mode, ShareType, SharingAudience } from './SharingInterfaces';

interface IEngagementExtraData {
    /* The ID of the client we're tracking. */
    clientId: ClientId;

    /* Which mode the share UI is in (i.e. how the UI was opened). */
    mode: Mode;

    /* Used to determine what kind of share was completed. */
    shareType?: ShareType;

    /* The audience of the sharing link that was shared (anonymous, CSL, canonical). */
    audience?: SharingAudience;

    /* Whether or not the share had edit permissions. */
    isEdit?: boolean;

    /* The number of recipients the sharing link was sent to. */
    recipientsCount?: number;

    /* The number of external recipients the sharing link was sent to. */
    externalRecipientsCount?: number;

    /* If share contained a message. */
    hasMessage?: boolean;

    /* Number of days until expiry for links that support expiration. */
    daysUntilExpiry?: number;

    /* Determines if link shared matches the default sharing link. */
    isDefaultLink?: boolean;
}

export default IEngagementExtraData;