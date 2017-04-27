import IFieldSchema from '../../interfaces/list/IFieldSchema';
import IServerField from '../../interfaces/list/IServerField';
import IField from '../../interfaces/list/IField';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

/** T
 * This list data source is an extension of the odb ListDataSource in odsp-next.
 * For all of these functions if the listFullUrl is specified it will be used, otherwise the list url from the page context will be used.
 */
export interface IListDataSource {
    /**
     * Creates a new field on a list. See IFieldSchema and https://msdn.microsoft.com/en-us/library/office/ms437580.aspx
     * for documentation about the available field attributes.
     * @returns Internal name of the created field.
     */
    createField(fieldSchema: IFieldSchema, listFullUrl?: string): Promise<string>;

    /**
     * Gets the fields available in the given list (not the current view).
     * @returns List of IField objects available in the given list.
     */
    getFields(listFullUrl?: string): Promise<IField[]>;

    /**
     * Gets a field using its internal name or title.
     * @returns IServerField interface for the field.
     */
    getField(internalNameOrTitle: string, listFullUrl?: string): Promise<IServerField>;

    /**
     * Edits a field. See IFieldSchema and https://msdn.microsoft.com/en-us/library/office/ms437580.aspx
     * for documentation about the available field attributes.
     * @returns Response text from the server.
     */
    editField(internalNameOrTitle: string, fieldSchema: IFieldSchema, listFullUrl?: string): Promise<string>;

    /**
     * Deletes a field using its internal name or title.
     * @returns Response text from the server.
     */
    deleteField(internalNameOrTitle: string, listFullUrl?: string): Promise<string>;
}

export default IListDataSource;
