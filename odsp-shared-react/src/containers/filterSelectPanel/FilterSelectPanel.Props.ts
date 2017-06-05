import { IFilterSelectStrings }  from '../../components/FilterSelect/index';
import { ISPListColumn, ColumnFieldType } from '@ms/odsp-datasources/lib/SPListItemProcessor';
import { IFilterOption, IFilterSectionInfo } from '@ms/odsp-datasources/lib/models/smartFilters/FilterSectionType';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IListFilterDataSource } from '@ms/odsp-datasources/lib/dataSources/filter/IListFilterDataSource';
import { ISPListContext } from '@ms/odsp-datasources/lib/SPListItemRetriever';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';

export interface IFilterSelectPanelProps {
  dependencies: IFilterSelectPanelDependencies;
  columnSchema: ISPListColumn;
  onComplete?: (filterSectionInfo: IFilterSectionInfo) => void;
  getFilterSuggestions?: (fieldName: string, fieldType: ColumnFieldType, beginWith: string) => Promise<IFilterOption[]>;
}

export interface IFilterSelectPanelDependencies {
  listContext: ISPListContext;
  pageContext: ISpPageContext;
  strings: IFilterSelectStrings;
  dataSource: IListFilterDataSource;
}