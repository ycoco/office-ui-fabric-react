interface IShareStrings {
    accessViaAnonEdit?: string; // SharingPrincipal TODO (joem): Remove before next major version bump.
    accessViaAnonView?: string; // SharingPrincipal TODO (joem): Remove before next major version bump.
    accessViaCslEdit?: string; // SharingPrincipal TODO (joem): Remove before next major version bump.
    accessViaCslView?: string; // SharingPrincipal TODO (joem): Remove before next major version bump.
    accessViaSharingLink: string; // SharingPrincipal
    activityMessageCreatingLink: string; // ShareMain
    activityMessageSendingMail: string; // ShareMain
    adminExpirationError: string; // PermissionsSettings
    allowEdit: string; // SharingPrincipal
    allowEditLabel: string; // PermissionsSettings
    and: string; // SendLink
    anonEditDescription: string; // ShareLink, ShareHintDetail
    anonEditDescriptionWithExpiry: string; // ShareLink
    anonViewDescription: string; // ShareLink, ShareHintDetail
    anonViewDescriptionWithExpiry: string; // ShareLink
    canEditLabel: string; // SharingPrincipal
    canViewLabel: string; // SharingPrincipal
    changeToViewOnly: string; // SharingPrincipal
    componentLoading: string; // Share
    copyLinkLabel: string; // ShareEndPointsData
    cslEditDescription: string; // ShareLink, ShareHintDetail
    cslViewDescription: string; // ShareLink, ShareHintDetail
    days: Array<string>; // ExpirationDatePicker
    disabledAnonymousLinkText: string; // InfoButton
    existingPeopleDescription: string; // ShareHintDetail
    expiresIn: string; // ShareHintDetail
    goToToday: string; // ExpirationDatePicker
    learnMoreLabel: string; // InfoButton
    loadingLabel: string; // PeoplePicker
    maxExpirationError: string; // PermissionsSettings
    messagePlaceholder: string; // SendLink
    modifyPermissionsHeader: string; // ModifyPermissions
    months: Array<string>; // ExpirationDatePicker
    noExternalSharing: string; // SendLink
    noResultsLabel: string; // PeoplePicker
    notificationCopied: string; // ShareNotification
    notificationCopyFailed: string; // ShareNotification
    notificationCopyFailedCta: string; // ShareNotification
    notificationSent: string; // ShareNotification
    notShared: string; // PermissionsList
    otherSettings: string; // PermissionsSettings
    outsideOfYourOrgSingular: string; // SendLink
    outsideOfYourOrgPlural: string; // SendLink
    pastDateExpirationError: string; // PermissionsSettings
    peoplePickerPlaceholder: string; // PeoplePicker
    peoplePickerPlaceholderWithSelection: string; // PeoplePicker
    permissionsAnyoneString: string; // PermissionsSettings
    permissionsCompanyString: string; // PermissionsSettings
    permissionsLabel: string; // PermissionsList, ShareMain
    permissionsSettingsHeader: string; // PermissionsSettings
    permissionsSpecificPeopleString: string; // PermissionsSettings
    sendButtonLabel: string; // ShareMain
    setExpirationDate: string; // ExpirationDatePicker
    shareLinkHeader: string; // ShareMain Share Link
    shortDays: Array<string>; // ExpirationDatePicker
    shortMonths: Array<string>; // ExpirationDatePicker, ShareHintDetail
    specificPeopleHint: string; // ShareHint
    specificPeopleOneEditHint: string; // ShareHint
    specificPeopleOneViewHint: string; // ShareHint
    specificPeopleThreeEditHint: string; // ShareHint
    specificPeopleThreePlusEditHint: string; // ShareHint
    specificPeopleThreePlusViewHint: string; // ShareHint
    specificPeopleThreeViewHint: string; // ShareHint
    specificPeopleTwoEditHint: string; // ShareHint
    specificPeopleTwoViewHint: string; // ShareHint
    stopSharing: string; // SharingPrincipal
    manageExistingAccessLabel: string; // Header
    folderHeader?: string; // Header TODO (joem): Make required before next major version bump.
    oneGroupInvited?: string; // SendLink TODO (joem): Make required before next major version bump.
    multipleGroupsInvited?: string; // SendLink TODO (joem): Make required before next major version bump.
}

export default IShareStrings;