
/**
 * Represents an item in any suite nav menu (app launcher, settings, person).
 * Properties are title-cased to match what the suite nav JS expects.
 */
export interface ISuiteNavLink {
    /** One of the SuiteNavLinkIds constants. */
    Id: string;
    /** URL the link should go to. */
    Url: string;
    /** Text of the link. If not provided, text will be determined based on Id. */
    Text?: string;
    /** Title text of the link. */
    Title?: string;
    /** Can be null or "_blank." */
    TargetWindow?: string;

    /** Optional parameters that don't appear to be used. */
    MenuName?: string;
    ServiceId?: any;
    SubLinks?: any;
}

/**
 * Strings for the "Id" option of suite nav links.
 * These are defined by the suite nav team and are used to correlate icons/colors with links.
 */
export const SUITE_NAV_LINK_IDS = {
    // Settings menu
    CUSTOM_SETTINGS_1: 'WorkloadSettingsSubLinks1',
    CUSTOM_SETTINGS_2: 'WorkloadSettingsSubLinks2',
    CUSTOM_SETTINGS_3: 'WorkloadSettingsSubLinks3',
    FEEDBACK: 'ShellFeedback',
    DIAGNOSTICS: 'Diagnostics',
    O365_SETTINGS: 'ShellO365Settings',
    ADD_APP: 'SuiteMenu_zz5_MenuItemCreate',
    SITE_CONTENTS: 'SuiteMenu_zz6_MenuItem_ViewAllSiteContents',
    SITE_SETTINGS: 'SuiteMenu_zz7_MenuItem_Settings',
    SITE_INFORMATION: 'SuiteMenu_MenuItem_SiteInformation',
    SITE_PERMISSIONS: 'SuiteMenu_MenuItem_SitePermissions',
    USER_ACTIVITY: 'UserActivity',
    LIBRARY_SETTINGS: 'SuiteMenu_LibrarySettings',
    LANGUAGE: 'SuiteMenu_Language',
    CHANGE_THE_LOOK: 'Change_The_Look',

    // Person menu
    /** "About me"/"Edit profile" */
    ABOUT_ME: 'ShellAboutMe',
    /** "Account settings" (ODC) */
    SETTINGS: 'ShellSettings',
    /** "My Settings" (ODB) */
    MY_SETTINGS: 'SuiteMenu_zz2_ID_PersonalInformation',
    SIGN_OUT: 'ShellSignout',

    // Help menu
    HELP: 'HelpLink',
    COMMUNITY: 'ShellCommunity',
    PRIVACY: 'ShellPrivacy',
    LEGAL: 'ShellLegal',
    USERVOICE: 'UserVoice',
    FIRSTRUN: 'FirstRun',
    DEVELOPERS: 'Developers',
    ABUSE: 'ReportAbuse',
    /** Corporate legal information per German/Austrian/Swiss law */
    IMPRESSUM: 'Impressum',

    // App switcher
    /** "Outlook" or "Outlook.com" */
    MAIL: 'ShellMail',
    CALENDAR: 'ShellCalendar',
    PEOPLE: 'ShellPeople',
    ONEDRIVE: 'ShellDocuments',
    WORD: 'ShellWordOnline',
    EXCEL: 'ShellExcelOnline',
    POWERPOINT: 'ShellPowerPointOnline',
    ONENOTE: 'ShellOneNoteOnline',
    SITES: 'ShellSites',
    YAMMER: 'ShellYammer',
    TASKS: 'ShellTasks',
    POWER_BI: 'ShellPowerBI',
    DELVE: 'ShellOfficeGraph',
    VIDEO: 'ShellVideo',
    ALCHEMY: 'ShellAlchemy',
    SMILE: 'ShellSendASmile'
};

export { SUITE_NAV_LINK_IDS  as ISuiteNavLinkIds };
export default ISuiteNavLink;
