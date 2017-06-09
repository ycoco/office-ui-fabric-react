// OneDrive:IgnoreCodeCoverage

/**
 * List template types, from SPListTemplateType in sts\Core\splist.cs.
 */
export enum ListTemplateType {
    // Note: some of these are commented because they're unused, and commenting them out
    // decreases the output file size.

    invalidType = -1,
    noListTemplate = 0,
    // begin usable types
    /** Custom list */
    genericList = 100,
    documentLibrary = 101,
    survey = 102,
    links = 103,
    announcements = 104,
    contacts = 105,
    /** Calendar */
    events = 106,
    tasks = 107,
    // discussionBoard = 108,
    pictureLibrary = 109,
    // /** Data sources for a site */
    // dataSources = 110,
    /** Site template gallery */
    webTemplateCatalog = 111,
    // userInformation = 112,
    webPartCatalog = 113,
    listTemplateCatalog = 114,
    xmlFormLibrary = 115,
    masterPageCatalog = 116,
    // noCodeWorkflows = 117,
    // /** Custom Workflow Process */
    // workflowProcess = 118,
    /** Wiki Page Library */
    webPageLibrary = 119,
    // /** Custom grid for a list */
    // customGrid = 120,
    solutionCatalog = 121,
    // noCodePublic = 122,
    themeCatalog = 123,
    designCatalog = 124,
    appDataCatalog = 125,
    // /** Data connection library for sharing information about external data connections */
    // dataConnectionLibrary = 130,
    // workflowHistory = 140,
    /** Project Tasks */
    ganttTasks = 150,
    // helpLibrary = 151,
    // accessRequest = 160,
    tasksWithTimelineAndHierarchy = 171,
    // maintenanceLogs = 175

    // Range 200-299 is used for Meetings List Template Id
    /** Meeting Series (Meeting) */
    meetings = 200,
    // /** Agenda (Meeting) */
    // agenda = 201,
    // /** Attendees (Meeting) */
    // meetingUser = 202,
    // /** Decisions (Meeting) */
    // decision = 204,
    // /** Objectives (Meeting) */
    // meetingObjective = 207,
    // /** Text Box (Meeting) */
    // textBox = 210,
    // /** Things To Bring (Meeting) */
    // thingsToBring = 211,
    // /** Workspace Pages (Meeting) */
    // homePageLibrary = 212,

    // /** Posts (Blog) */
    // posts = 301,
    // /** Comments (Blog) */
    // comments = 302,
    // /** Categories (Blog) */
    // categories = 303,

    // // Range 400-499 is used for lists that are specific to GroupBoard (Group Work Site).
    // facility = 402,
    // whereabouts = 403,
    // callTrack = 404,
    // circulation = 405,
    // timecard = 420,
    // holidays = 421,
    // IMEDic = 499,

    externalList = 600,

    mySiteDocumentLibrary = 700,

    // issueTracking = 1100

    // adminTasks = 1200,
    // healthRules = 1220,
    // healthReports = 1221,
    // developerSiteDraftApps = 1230,

    // accessApp = 3100, // Access app entry point
    // alchemyMobileForm = 3101, // Mobile form app entry point
    // alchemyApprovalWorkflow = 3102, // Approval workflow app entry point

    // sharingLinks = 3300
}

const DOCLIB_TEMPLATES = [
    // NOTE: If updating these, also update the isDocumentLibrary check in odsp-next ListViewDataPrefetch!
    ListTemplateType.mySiteDocumentLibrary,
    ListTemplateType.documentLibrary,
    ListTemplateType.pictureLibrary,
    ListTemplateType.xmlFormLibrary,
    ListTemplateType.webPageLibrary
];

/**
 * Returns true if the list template is any type of document library:
 * standard, mysite, picture, XML form, or web page.
 */
export function isDocumentLibrary(template: ListTemplateType | string | number): boolean {
    'use strict';
    let templateEnum = <ListTemplateType>Number(template);
    return DOCLIB_TEMPLATES.indexOf(templateEnum) !== -1;
}

export function isGenericList(template: ListTemplateType) : boolean {
    'use strict';
    return template === ListTemplateType.genericList || template === ListTemplateType.announcements;
}

export default ListTemplateType;
