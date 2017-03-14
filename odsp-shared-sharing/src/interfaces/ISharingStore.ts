import { ISharingInformation, ISharingLinkSettings, SharingLinkKind, SharingRole, ISharingLink } from './SharingInterfaces';

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
     // TODO (joem): Make required before next major version bump.
     isCleanupRequired?(): boolean;
}

export default ISharingStore;