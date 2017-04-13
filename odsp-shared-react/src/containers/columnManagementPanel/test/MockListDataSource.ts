import DataSource from '@ms/odsp-datasources/lib/dataSources/base/DataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IListDataSource, IFieldSchema } from '@ms/odsp-datasources/lib/List';

export class MockListDataSource extends DataSource implements IListDataSource {
  public createField(fieldSchema: IFieldSchema) {
    return Promise.wrap(fieldSchema.DisplayName);
  }
}

export default MockListDataSource;