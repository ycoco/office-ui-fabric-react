import SharingType from './SharingType';

export function usePrivateFolderIcon(itemSharingType: SharingType): boolean {
    return (itemSharingType === undefined ||
        itemSharingType === SharingType.Private ||
        itemSharingType === SharingType.Unknown); // erring on caution--if sharingType is Unknown, show it as not shared
}

export function showSubTextSharingIcon(itemSharingType: SharingType): boolean {
    return (itemSharingType !== undefined && // all non-private (or empty) cases are considered as shared
        itemSharingType !== SharingType.Private &&
        itemSharingType !== SharingType.Unknown); // additionally, the Unknown case should be not shared as well
}

export function shouldRequestSharedWithData(itemSharingType: SharingType): boolean {
    return (itemSharingType !== SharingType.Private); // not including Unknown, should fetch the shared with information when uncertain
}

export function useSharedFolderAriaLabel(itemSharingType: SharingType): boolean {
    return (itemSharingType === SharingType.Shared); // not including Unknown, don't mentioned sharing state when uncertain
}