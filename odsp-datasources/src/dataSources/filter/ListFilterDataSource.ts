import DataSource from '../base/DataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import * as AddressParser from '@ms/odsp-utilities/lib/navigation/AddressParser';
import { ColumnFieldType } from '../item/spListItemProcessor/SPListItemEnums';
import { ISPListContext } from '../item/spListItemRetriever/interfaces/ISPListContext';
import { ItemUrlHelper } from '../../utilities/url/ItemUrlHelper';
import { ApiUrlHelper } from '../../utilities/url/ApiUrlHelper';
import ListFilterUtilities from '../../utilities/list/ListFilterUtilities';
import { getFolderPath } from '../../utilities/list/DataSourceUtilities';
import { IListFilterDataSource, IListFilterDataSourceParams } from './IListFilterDataSource';

const useFiltersInViewXmlKey = 'useFiltersInViewXml';

export class ListFilterDataSource extends DataSource implements IListFilterDataSource {
  private _itemUrlHelper: ItemUrlHelper;
  private _apiUrlHelper: ApiUrlHelper;
  private _listContext: ISPListContext;
  private _folderPath: string;

  constructor(params: IListFilterDataSourceParams) {
      super(params.pageContext);

      this._listContext = params.listContext;
      this._itemUrlHelper = params.itemUrlHelper || new ItemUrlHelper({}, { pageContext: params.pageContext });
      this._apiUrlHelper = params.apiUrlHelper || new ApiUrlHelper({}, { pageContext: params.pageContext, itemUrlHelper: this._itemUrlHelper });
      this._folderPath = params.folderPath || getFolderPath(params.parentKey, this._listContext);
  }

  public getFilterData(
    filterField: string,
    viewParams: string,
    viewId: string,
    filterFieldType?: ColumnFieldType): Promise<string> {
      return this.getData(
          () => this._getFilterDataUrl(filterField, viewParams, viewId, filterFieldType),
          (responseText: string) => responseText,
          'GetFilterData'
      );
  }

  private _getFilterDataUrl(filterField: string, queryString: string, viewId: string, filterFieldType?: ColumnFieldType): string {
    let listUrlParts = this._itemUrlHelper.getUrlParts({
        path: this._listContext.listUrl,
        listUrl: this._listContext.listUrl
    });

    let apiUrl = this._apiUrlHelper.build()
        .webByItemUrl(listUrlParts)
        .method('GetList', listUrlParts.serverRelativeListUrl)
        .segment('RenderListFilterData')
        .parameter('FieldInternalName', filterField);

    // cannot trust the folderPath and viewId saved on listContext, it may be stale
    if (viewId) {
        apiUrl = apiUrl.parameter('ViewId', viewId);
    }

    if (this._folderPath) {
        // parameter() wraps values in single-quotes which isn't supported on the server for RootFolder
        // workaround server limitation by passing as rawParameter() without quotes
        apiUrl = apiUrl.parameter('RootFolder', {
            raw: UriEncoding.encodeURIComponent(this._folderPath)
        });
    }

    if (filterFieldType && filterFieldType === ColumnFieldType.Taxonomy) {
        apiUrl = apiUrl.parameter('ExcludeFieldFilteringHtml', true);
    }

    const queryParams = AddressParser.deserializeQuery(queryString);
    if (!queryParams[useFiltersInViewXmlKey]) {
        let filterQueryString = ListFilterUtilities.getFilterParams(queryString);

        apiUrl = apiUrl.rawParameter(filterQueryString);
    }

    return apiUrl.toString();
  }
}

export default ListFilterDataSource;