interface IShareStrings {
    accessViaAnonEdit: string; // SharingPrincipal
    accessViaAnonView: string; // SharingPrincipal
    accessViaCslEdit: string; // SharingPrincipal
    accessViaCslView: string; // SharingPrincipal
    activityMessageCreatingLink: string; // ShareMain
    activityMessageSendingMail: string; // ShareMain
    adminExpirationError: string; // PermissionsSettings
    allowEdit: string; // SharingPrincipal
    allowEditLabel: string; // PermissionsSettings
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
    expiresIn: string; // ShareHintDetail
    goToToday: string; // ExpirationDatePicker
    loadingLabel: string; // PeoplePicker
    maxExpirationError: string; // PermissionsSettings
    messagePlaceholder: string; // SendLink
    modifyPermissionsHeader: string; // ModifyPermissions
    months: Array<string>; // ExpirationDatePicker
    noExternalSharing: string; // SendLink
    noResultsLabel: string; // PeoplePicker
    notificationCopied: string; // ShareNotification
    notificationSent: string; // ShareNotification
    notShared: string; // PermissionsList
    otherSettings: string; // PermissionsSettings
    otherWaysToShare: string; // ShareEndPoints
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
    stopSharing: string; // SharingPrincipal
}

export default IShareStrings;