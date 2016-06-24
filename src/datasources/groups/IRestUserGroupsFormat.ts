// OneDrive:IgnoreCodeCoverage

interface IRestUserGroupsFormat {
    /**
     * Unqualified alias of the group (i.e. without @service.microsoft.com)
     */
    alias: string;
    /**
     * Display Name of the Group
     */
    displayName: string;
    /**
     * Direct link to the documents url
     */
    documentsUrl: string;
    /**
     * GUID of the group
     */
    id: string;
    /**
     * Link to the site url, which will redirect (usually) to the documents url.
     */
    siteUrl: string;
}

export default IRestUserGroupsFormat;