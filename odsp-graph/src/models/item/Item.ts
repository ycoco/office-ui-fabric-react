
// OneDrive:IgnoreCodeCoverage

export const enum GuidedTourAction {
    Upload,
    Mobile,
    Sync,
    Share,
    Final
}

/**
 * An interface to describe the user's info about the guided tour
 */
export interface IGuidedTourData {
    /**
     * Is user completed flag. 0 if user has not completed it, 1 if they have.
     * We use a single letter to denote this field due to backend length constraints.
     * @type {boolean}
     */
    c: boolean;
    /**
     * User's view count of the guided tour.
     * We use a single letter to denote this field due to backend length constraints.
     * @type {number}
     */
    v: number;
    /**
     * Has user uploaded. 0 if user has not uploaded a file, 1 if they have.
     * We use a single letter to denote this field due to backend length constraints.
     * @type {boolean}
     */
    u: boolean;
    /**
     * Has user completed mobile task. 0 if user has not finished the task, 1 if they have.
     * We use a single letter to denote this field due to backend length constraints.
     * @type {boolean}
     */
    m: boolean;
    /**
     * Has user completed sync task. 0 if user has not finished the task, 1 if they have.
     * We use a single letter to denote this field due to backend length constraints.
     * @type {boolean}
     */
    s: boolean;
    /**
     * Has user completed share task. 0 if user has not finished the task, 1 if they have.
     * We use two letters to denote this field due to backend length constraints and since 's' is taken
     * @type {boolean}
     */
    sh: boolean;
    /**
     * Has user completed final task. 0 if user has not finished the task, 1 if they have.
     * We use a single letter to denote this field due to backend length constraints.
     * @type {boolean}
     */
    f: boolean;
}

export interface ITeachingBubbleUserFact {
    /**
     * Is user dismissed flag. False if user has not dismissed it, True if they have.
     * @type {boolean}
     */
    d: boolean;
    /**
     * User's view count of the upsell.
     * We use a single letter to denote this field due to backend length constraints.
     * @type {number}
     */
    v: number;
}

export interface IUpsellUserFact {
    /**
     * Is user dismissed flag. False if user has not dismissed it, true if they have.
     * We use a single letter to denote this field due to backend length constraints.
     * @type {boolean}
     */
    d: boolean;
    /**
     * User's view count of the upsell.
     * We use a single letter to denote this field due to backend length constraints.
     * @type {number}
     */
    v: number;
}

export interface IIdentity {
    id?: string;
    email?: string;
    displayName: string;
    thumbnails?: IThumbnailSet;
}

export interface IIdentitySet {
    user?: IIdentity;
    application?: IIdentity;
    device?: IIdentity;
}

export interface IDrive {
    id: string;
    driveType: string;
    owner: IIdentitySet;
    quota: IQuota;
}

export interface IItemReference {
    driveId: string;
    id: string;
    path: string;
}

export interface IFolder {
    childCount: number;
}

export const enum DriveType {
    personal,
    business
}

export const enum QuotaState {
    normal,
    nearing,
    critical,
    exceeded
}

export interface IQuota {
    total: number;
    used: number;
    remaining: number;
    deleted: number;
    state: string;
}

export interface IAudio {
    album: string;
    albumArtist: string;
    artist: string;
    bitrate: number;
    composers: string;
    copyright: string;
    disc: number;
    discCount: number;
    duration: number;
    genre: string;
    hasDrm: boolean;
    isVariableBitrate: boolean;
    title: string;
    track: number;
    trackCount: number;
    year: number;
}

export interface IPhoto {
    takenDateTime: string;
    cameraMake: string;
    cameraModel: string;
    fNumber: number;
    exposureDenominator: number;
    exposureNumerator: number;
    focalLength: number;
    iso: number;
}

export interface IVideo {
    bitrate: number;
    duration: number;
    width: number;
    height: number;
}

export interface IImage {
    width: number;
    height: number;
}

export interface ILocation {
    altitude: number;
    latitude: number;
    longitude: number;
}

export interface ISearchResult {
    onClickTelemetryUrl: string;
}

export interface IDeleted {
    // Nothing.
}

export interface IRoot {
    // Nothing.
}

export interface ISpecialFolder {
    name: string;
}

export interface IThumbnail {
    width: number;
    height: number;
    url: string;
}

export interface IThumbnailSet {
    id: string;
    small: IThumbnail;
    medium: IThumbnail;
    large: IThumbnail;
    source: IThumbnail;
}

export interface IHashes {
    sha1Hash: string;
    crc32hash: string;
}

export interface IFile {
    mimeType: string;
    hashes: IHashes;
}

export interface IFileSystemInfo {
    createdDateTime: string;
    lastModifiedDateTime: string;
}

export interface IItemWrapper {
    id: string;
    createdDateTime: string;
    lastModifiedDateTime: string;
    remoteItem: IItem;
    size: number;
}

export interface IItem {
    id: string;
    name: string;
    eTag: string;
    cTag: string;
    createdBy: IIdentitySet;
    createdDateTime: string;
    lastModifiedBy: IIdentitySet;
    lastModifiedDateTime: string;
    size: number;
    webUrl: string;
    webDavUrl: string;
    description: string;
    parentReference: IItemReference;
    folder?: IFolder;
    file?: IFile;
    fileSystemInfo?: IFileSystemInfo;
    image?: IImage;
    photo?: IPhoto;
    audio?: IAudio;
    video?: IVideo;
    location?: ILocation;
    searchResult?: ISearchResult;
    specialFolder?: ISpecialFolder;
    thumbnails?: IThumbnailSet;
    shared?: IShared;

    // indicates if the is deleted (available in view.delta responses)
    deleted?: IDeleted;

    // indicates if the item is the root folder
    root?: IRoot;

    '@content.downloadUrl': string;
    sharepointIds?: ISharePoint;

    /*
     * Custom facet for Guided Tour data
     */
    guidedTour_oneDrive?: IGuidedTourData;

    /*
     * Custom facet for teaching bubble data
     */
    teachingBubbles_oneDrive?: {
        [campaignGuid: string]: ITeachingBubbleUserFact;
    };

    upsells_oneDrive?: {
        [upsellId: number]: IUpsellUserFact;
    };
}

export interface ISharePoint {
    listId: string;
    listItemId: string;
    listItemUniqueId: string;
    siteId: string;
    webId: string;
}

export type SharingLinkType = 'edit' | 'view' | 'embed';
export type SharingLinkScope = 'anonymous' | 'organization';

export interface ISharingLink {
    application: IIdentity;
    type: SharingLinkType;
    scope: SharingLinkScope;
    webHtml: string;
    webUrl: string;
}

export interface ISharingInvitation {
    email: string;
    signInRequired: boolean;
    invitedBy: IIdentity;
}

export interface ISharedWithMeResponse {
    value: IItemWrapper[];
}

export interface IShared {
    scope: string;
    sharedBy: IIdentitySet;
    sharedDateTime: string;
}

export interface IPermission {
    id: string;
    role: string[];
    link: ISharingLink;
    grantedTo: IIdentitySet;
    invition: ISharingInvitation;
    inheritedFrom: IItemReference;
    shareId: string;
}

export interface IPagedResponse {
    '@odata.nextLink': string;
}
