import ListTemplateType from './ListTemplateType';

/**
 * Represents a SharePoint list.
 */
interface ISPList {
    /** The displayed title for the list. */
    title: string;
    /** The description for the list. */
    description: string;
    /** The URL of the default view for the list. */
    defaultViewUrl: string;
    /** The list definition type on which the list is based. */
    baseTemplate: ListTemplateType;
    /** A Boolean value that specifies whether the list is hidden. */
    hidden: boolean;
    /** The GUID that identifies the list in the database */
    id?: string;
}
export default ISPList;
