
// OneDrive:IgnoreCodeCoverage

import * as ObjectUtil from '@ms/odsp-utilities/lib/object/ObjectUtil';
import IGuidedTourData from '../../services/guidedTour/GuidedTourUserFact';
import ITeachingBubbleUserFact from '../../services/teachingBubble/ITeachingBubbleUserFact';

export type ErrorCode = keyof ({
    accessDenied,
    activityLimitReached,
    generalException,
    invalidRange,
    invalidRequest,
    itemNotFound,
    malwareDetected,
    nameAlreadyExists,
    notAllowed,
    notSupported,
    resourceModified,
    resyncRequired,
    serviceNotAvailable,
    quotaLimitReached,
    unauthenticated
});

export type InnerErrorCode = keyof ({
    accessRestricted,
    cannotSnapshotTree,
    childItemCountExceeded,
    entityTagDoesNotMatch,
    fragmentLengthMismatch,
    fragmentOutOfOrder,
    fragmentOverlap,
    invalidAcceptType,
    invalidParameterFormat,
    invalidPath,
    invalidStartIndex,
    lockMismatch,
    lockNotFoundOrAlreadyExpired,
    lockOwnerMismatch,
    malformedEntityTag,
    maxDocumentCountExceeded,
    maxFileSizeExceeded,
    maxFolderCountExceeded,
    maxFragmentLengthExceeded,
    maxItemCountExceeded,
    maxQueryLengthExceeded,
    maxStreamSizeExceeded,
    nameContainsInvalidCharacters,
    parameterIsTooLong,
    parameterIsTooSmall,
    pathIsTooLong,
    pathIsTooDeep,
    propertyNotUpdateable,
    resyncApplyDifferences,
    resyncUploadDifferences,
    serviceReadOnly,
    throttledRequest,
    tooManyResultsRequested,
    tooManyItemsInQuery,
    totalAffectedItemCountExceeded,
    truncationNotAllowed,
    uploadSessionFailed,
    uploadSessionIncomplete,
    uploadSessionNotFound,
    versionNumberDoesNotMatch,
    virusSuspicious,
    zeroOrFewerResultsRequested
});

export interface IError {
    code: ErrorCode | InnerErrorCode;
    message?: string;
    innererror?: IError;
    stackTrace?: string;
    debugMessage?: string;
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

export interface ISubscription {
    id: string;
    muted: boolean;
    expirationDateTime: string;
    notificationUrl: string;
    resource: string;
    scenarios: string[];
    createdBy: IIdentitySet;
}

export interface IIncompleteData {
    missingDataBeforeDateTime: string;
    wasThrottled: boolean;
}

export interface IActivity {
    activityDateTime: string;
    activityType: string;
    actor: IActor;
    location?: string;
}

export interface IActor {
    application?: string;
    user: IUser;
}

export interface IUser {
    displayName: string;
    id: string;
}

export interface ISubscriptionRequestContext {
    muted?: boolean;
    expirationDateTime?: string;
    expiresAfterDuration?: string;
    notificationUrl: string;
    scenarios?: string[];
}

export interface ICreateSharingLinkRequest {
    type: SharingLinkType;
    scope?: SharingLinkScope;
}

export enum SubscriptionScenarios {
    FollowAFile,
    SkyDriveFileSync,
    WindowsProfilePhoto,
    WindowsSettings
}

export interface ISubscriptionsResponse {
    value: ISubscription[];
}

export interface IItemAnalyticsResponse {
    activities: IActivity[];
    incompleteData: IIncompleteData;
    interval: string;
    lastActivityDateTime: string;
    startDateTime: string;
    viewCount: number;
    viewerCount: number;
}

export interface IPagedResponse {
    '@odata.nextLink': string;
}

export interface ISearchResponse extends IPagedResponse {
    value: IItem[];
    '@search.approximateCount': number;
}

export interface IWebhookResponse {
    subscriptionId: string;
    subscriptionExpirationDateTime: string;
    userId: string;
    resource: string;
}

export interface IViewDeltaResponse extends IPagedResponse {
    value: IItem[];
    '@delta.token': string;
}

export interface IErrorResponse {
    error?: IError;
}

export interface IErrorParams {
    response?: IErrorResponse;
    status: number;
    request?: XMLHttpRequest;
}

export class VroomError implements Error {
    public readonly name: string;
    public readonly message: string;
    public readonly response: IErrorResponse;
    public readonly status: number;
    public readonly serverStack: string;
    public readonly error: Error;
    public readonly type: this;
    public readonly request: XMLHttpRequest;

    constructor(error: Error, params: IErrorParams) {
        const {
            response: {
                error: {
                    innererror: {
                        stackTrace = ''
                    } = {}
                } = {}
            } = {},
            response,
            request,
            status
        } = params;

        const {
            message
        } = error;

        this.name = 'VroomError';
        this.message = message;
        this.type = this;
        this.response = response;
        this.status = status;
        this.serverStack = stackTrace;
        this.request = request;
        this.error = error;

        return ObjectUtil.extend(error, this);
    }
}

export function isVroomError(error: Error): error is VroomError {
    return (<VroomError>error).type instanceof VroomError;
}

export function getQosExtraDataFromError(error: Error): { [key: string]: string | number | boolean; } {
    const extraData: {
        [key: string]: string | number | boolean;
    } = {};

    const errorMessage = 'errorMessage';
    const vroomStatus = 'vroomStatus';
    const vroomErrorCode = 'vroomErrorCode';
    const vroomErrorMessage = 'vroomErrorMessage';
    const vroomErrorInnerCode = 'vroomErrorInnerCode';
    const vroomErrorInnerMessage = 'vroomErrorInnerMessage';
    const vroomErrorInnerDebugMessage = 'vroomErrorInnerDebugMessage';
    const vroomErrorInnerStack = 'vroomErrorInnerStack';

    extraData[errorMessage] = error.message;

    if (isVroomError(error)) {
        extraData[vroomStatus] = error.status;

        const {
            response
        } = error;

        if (response && response.error) {
            const responseError = response.error;

            extraData[vroomErrorCode] = responseError.code;
            extraData[vroomErrorMessage] = responseError.message;

            const innerError = responseError.innererror;

            if (innerError) {
                extraData[vroomErrorInnerCode] = innerError.code;
                extraData[vroomErrorInnerMessage] = innerError.message;
                extraData[vroomErrorInnerDebugMessage] = innerError.debugMessage;
                extraData[vroomErrorInnerStack] = innerError.stackTrace;
            }
        }
    }

    return extraData;
}

export function getErrorResolution<T>(error: Error, resolveError: (code: ErrorCode | InnerErrorCode | number, error?: VroomError) => T): T | undefined {
    if (isVroomError(error)) {
        const {
            response,
            status
        } = error;

        if (response) {
            const innerErrors: IError[] = [];

            let innerError = response.error;

            while (innerError) {
                innerErrors.push(innerError);

                innerError = innerError.innererror;
            }

            while (innerError = innerErrors.pop()) {
                const resolution = resolveError(innerError.code, error);

                if (resolution !== undefined) {
                    return resolution;
                }
            }
        }

        return resolveError(status, error);
    }
}