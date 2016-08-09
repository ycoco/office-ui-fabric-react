import ListTemplateType from './ListTemplateType';

/**
 * Represents a SharePoint list
 */
interface ISPList {
    title: string;
    description: string;
    defaultViewUrl: string;
    baseTemplate: ListTemplateType;
    hidden: boolean;
}
export default ISPList;