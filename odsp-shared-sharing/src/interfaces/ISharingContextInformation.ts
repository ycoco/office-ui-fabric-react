/**
 * This interface represents the necessary information that clients need to provide
 * in order to host the share UI within their applications. Please refer to this
 * visualization (https://aka.ms/isharingcontextinformation) for information on how
 * some of these properties are used in the UI, or please get in touch with joem
 * with any additional questions.
 */

import PrincipalType from './enums/PrincipalType';
import SharingLinkKind from './enums/SharingLinkKind';
import SharingRole from './enums/SharingRole';

interface ISharingContextInformation {
    /* The client's auth token to make API calls. */
    authToken: string;

    /**
     * Identifying client ID from client to identify them. This value is used
     * for telemetry, as well as showing/hiding UI elements that may or may not
     * be applicable for the client.
     */
    clientId: string;

    /* Label of the farm; used for telemetry. */
    farmLabel?: string;

    /**
     * The list URL of the list the item being shared belongs to. This property (plus
     * serverRelativeItemUrl) is required for item resolution. If not supplied,
     * resourceId must be provided.
     * i.e. "https://contoso-my.sharepoint.com/personal/johnd_contoso_com/Documents"
     */
    listUrl?: string;

    /**
     * Property determines if item belongs to an ODB or a team site. We use this
     * to show/hide UI elements depending on the scenario.
     */
    isODB?: boolean;

    /**
     * Number of items in a folder being shared. This is used to display the number
     * of items within a folder being shared. If not supplied, it just won't be shown.
     */
    itemCount? : number;

    /* Name of the item being shared. */
    itemName: string;

    /**
     * Absolute URL to the item being shared. This property is required for item resolution.
     * If supplied, do not provide listUrl, serverRealtiveItemUrl, or resourceId.
     * i.e. "https://contoso-my.sharepoint.com/personal/johnd_contoso_com/Documents/word-document.docx"
     */
    itemUrl?: string;

    /**
     * Friendly name of the organization.
     * i.e. "Contoso"
     */
    organizationName?: string;

    /**
     * The resource ID of an item, as understood by the sync client. This property
     * is required for item resolution. If not supplied, listUrl AND serverRelativeItemUrl
     * must be provided.
     * i.e. "0eed227c2bb44cb2bdd25129d67a3310"
     */
    resourceId?: string;

    /**
     * The server relative path to the item being shared. This property (plus
     * listUrl) is required for item resolution. If not supplied, resourceId must
     * be provided.
     * i.e. "/personal/johnd_contoso_com/Documents/word-document.docx"
     */
    serverRelativeItemUrl?: string;

    /* ID of the tenant (GUID); used for telemetry. */
    siteSubscriptionId?: string;

    /**
     * Display name of the signed-in user. Only necessary for clients who support Outlook
     * share target.
     * i.e. "John Doe"
     */
    userDisplayName?: string;

    /**
     * Absolute URL of the web.
     * i.e. "https://contoso-my.sharepoint.com/personal/johnd_contoso_com"
     */
    webAbsoluteUrl: string;
}

export default ISharingContextInformation;