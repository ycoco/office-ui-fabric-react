import ICreateFieldOptions from './ICreateFieldOptions';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

/** This list data source is an extension of the odb ListDataSource in odsp-next. */
export interface IListDataSource {
    /** Creates a new field on a list. See ICreateFieldOptions and https://msdn.microsoft.com/en-us/library/office/ms437580.aspx
     * for documentation about the available field attributes.
     * @returns Internal name of the created field. */
    createField(options: ICreateFieldOptions): Promise<string>;
}

export default IListDataSource;
