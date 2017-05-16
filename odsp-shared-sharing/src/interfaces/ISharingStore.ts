import { ISharingInformation, ISharingLinkSettings, SharingLinkKind, SharingRole, ISharingLink, IPolicyTipInformation } from './SharingInterfaces';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import { PolicyTipUserAction } from '@ms/odsp-datasources/lib/PolicyTip';

interface ISharingStore {
    /* Add a callback to be executed when the store updates. */
    addListener(listener: () => void): void;

     /* Get the ISharingInformation object from the store. */
     getSharingInformation(): ISharingInformation;

     /* Tell store to make an API call to get new sharing information. */
     fetchSharingInformation(): void;

     /* Create or send a sharing link. */
     shareLink(settings: ISharingLinkSettings, recipients?: Array<any>, emailData?: string, copyLinkShortcut?: boolean): void;

     /* Unshare a link. */
     unshareLink(sharingLinkKind: SharingLinkKind, shareId: string): void;

     /* Get the sharing link created by the store. */
     getSharingLinkCreated(): ISharingLink;

     /* Update permissions for an ACL'ed user. */
     updatePermissions(entity: any, role: SharingRole): void;

     /* Determines if default link needs to be deleted. */
     isCleanupRequired(): boolean;

     /* Gets company (i.e. tenant) name. */
     getCompanyName(): string;

     /* Tells store to fetch company name. */
     fetchCompanyName(): void;

     /* Notifies host that user wants to share link via Outlook. */
     navigateToOwa(): void;

     /* Tell store to figure out how many group members are being shared to. */
     fetchGroupsMemberCount(items: Array<IPerson>): void;

     /* Get number of group members are being shared to from the store. */
     getGroupsMemberCount(): number;

     /* Tell store to get policy tip information about the item being shared. */
     fetchPolicyTipInformation(): void;

     /* Get policy tip information about the item being shared from the store. */
     getPolicyTipInformation(): IPolicyTipInformation;

     /* Update policy for the given item. */
     updatePolicy(action: PolicyTipUserAction, justificationText?: string): void;

    /* Checks if a recipient (identified by email address) has access to the given item. */
    checkPermissions(recipients: Array<IPerson>);

    /* Gets permission map from store. */
    getPermissionsMap();
}

export default ISharingStore;