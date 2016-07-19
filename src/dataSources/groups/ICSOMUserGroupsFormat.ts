// OneDrive:IgnoreCodeCoverage

interface ICSOMUserGroupsFormat {
    /**
     * Unqualified alias of the group (i.e. without @service.microsoft.com)
     */
    Alias: string;
    /**
     * Display Name of the Group
     */
    DisplayName: string;
    /**
     * Direct link to the documents url
     */
    DocumentsUrl: string;
    /**
     * GUID of the group
     */
    Id: string;
    /**
     * Link to the site url, which will redirect (usually) to the documents url.
     */
    SiteUrl: string;
}

export default ICSOMUserGroupsFormat;