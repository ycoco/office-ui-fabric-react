export interface IPeoplePickerQueryParams {
    allowEmailAddresses?: boolean;
    allowOnlyEmailAddresses?: boolean;
    allowMultipleEntities?: boolean;
    allUrlZones?: boolean;
    enabledClaimProviders?: string;
    forceClaims?: boolean;
    groupID?: number; // filter people by membership in a SharePoint group, groupID of 0 means no group restrictions
    maximumEntitySuggestions: number;
    principalSource?: number;
    principalType?: number;
    required?: boolean;
    urlZone?: number;
    urlZoneSpecified?: boolean;
    filterExternalUsers?: boolean;
    blockExternalUsers?: boolean; // Don't filter out external users, but notify user it's an errant choice.
    querySettings?: any;
}