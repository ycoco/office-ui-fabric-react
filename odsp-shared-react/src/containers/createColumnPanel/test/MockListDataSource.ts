import DataSource from '@ms/odsp-datasources/lib/dataSources/base/DataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IListDataSource, ICreateFieldOptions } from '@ms/odsp-datasources/lib/List';

export class MockListDataSource extends DataSource implements IListDataSource {
  public createField(options: ICreateFieldOptions) {
    return Promise.wrap(options.displayName);
  }
}

export default MockListDataSource;