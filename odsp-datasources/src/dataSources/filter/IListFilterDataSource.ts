import { ColumnFieldType } from '../item/spListItemProcessor/SPListItemEnums';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { ISPListContext } from '../item/spListItemRetriever/interfaces/ISPListContext';
import ISpPageContext from '../../interfaces/ISpPageContext';
import { ItemUrlHelper } from '../../utilities/url/ItemUrlHelper';
import { ApiUrlHelper } from '../../utilities/url/ApiUrlHelper';

export interface IListFilterDataSource {
  /**
   * Gets possible filter options for the given field based on the current filter state in the viewParams
   */
  getFilterData(filterField: string, viewParams: string, viewId: string, filterFieldType?: ColumnFieldType): Promise<string>;
}

export interface IListFilterDataSourceParams {
  parentKey: string;
  listContext: ISPListContext;
  pageContext: ISpPageContext;
  folderPath?: string;
  itemUrlHelper?: ItemUrlHelper;
  apiUrlHelper?: ApiUrlHelper;
}