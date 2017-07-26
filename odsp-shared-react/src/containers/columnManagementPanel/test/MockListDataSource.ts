import DataSource from '@ms/odsp-datasources/lib/dataSources/base/DataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IListDataSource, IFieldSchema, FieldType, IServerField, IField } from '@ms/odsp-datasources/lib/List';

export class MockListDataSource extends DataSource implements IListDataSource {
  public createField(fieldSchema: IFieldSchema, listFullUrl?: string): Promise<string> {
    return Promise.wrap(fieldSchema.DisplayName);
  }

  public getFields(listFullUrl?: string): Promise<IField[]> {
      let mockListField: IField[] = [{
        id: "id",
        internalName: "internal name",
        isHidden: false,
        title: "Test Column",
        isRequired: false
      }];
      return Promise.wrap(mockListField);
  }

  public getField(internalNameOrTitle: string, listFullUrl?: string): Promise<IServerField> {
    let serverField = {
      TypeAsString: FieldType[FieldType.Choice],
      Title: internalNameOrTitle
    };
    return Promise.wrap(serverField);
  }

  public editField(internalNameOrTitle: string, fieldSchema: IFieldSchema, listFullUrl?: string): Promise<string> {
    return Promise.wrap("success");
  }

  public deleteField(internalNameOrTitle: string, listFullUrl?: string): Promise<string> {
    return Promise.wrap("success");
  }

  public setFieldPropertyValueAsString(internalNameOrTitle: string, propertyName: string, propertyValue: string, listFullUrl?: string): Promise<string> {
    return Promise.wrap("success");
  }
}

export default MockListDataSource;