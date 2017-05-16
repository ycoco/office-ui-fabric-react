import { ColumnFieldType } from '@ms/odsp-datasources/lib/dataSources/item/spListItemProcessor/SPListItemEnums';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { ISPListColumn } from '@ms/odsp-datasources/lib/SPListItemProcessorHelpers';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import IView from '@ms/odsp-datasources/lib/interfaces/view/IView';
import * as SmartFiltersHelper from '@ms/odsp-list-utilities/lib/smartFilters/SmartFiltersHelper';
import { IFilterSectionInfo, IFilterOption } from '@ms/odsp-datasources/lib/models/smartFilters/FilterSectionType';
import { ICheckboxFilterSectionStrings } from '../FiltersPane/sections/CheckboxFilterSection';

export interface IFilterSelectProps {
    /**
     * required dependencies.
     */
    dependencies: IFilterSelectDependencies;

    /**
     * required localized display strings.
     */
    strings: IFilterSelectStrings;

    /**
     * current view params to get filter information from.
     */
    viewParamsString: string;

    /**
     * column Schema. We can use it to get filter information.
     */
    columnSchema: ISPListColumn;

    /**
     * filter section infomation.
     */
    filterSectionInfo?: IFilterSectionInfo;

    /**
     * call back function when user click apply button.
     */
    onComplete?: (filterSectionInfo: IFilterSectionInfo) => {};

    /**
     * callback function to return filter strings beginning with the given string.
     */
    getFilterSuggestions?: (fieldName: string, fieldType: ColumnFieldType, beginWith: string) => Promise<IFilterOption[]>;
}

export interface IFilterSelectDependencies {
    /**
     * data source to fetch filter information.
     */
    dataSource?: IFilterSelectDataSource;

    /**
     * call back function to get icon url from item extension.
     */
    getIconUrlFromExtension?: (extension: string) => string;

    /**
     * event scope to raise events for applying the filter.
     */
    eventScope?: Object;

    /**
     * host settings.
     */
    pageContext?: ISpPageContext;

    /**
     * current view of the list.
     */
    currentView?: IView;
}

export interface IFilterSelectDataSource {
    getFilterData: (filterField: string, queryString: string, viewId: string, filterFieldType?: ColumnFieldType) => Promise<any>;
}

export interface IFilterSelectStrings {
    filterSelect: IFilterSelectLocalStrings;
    smartFilter: SmartFiltersHelper.ISmartFilterStrings;
    checkboxFilterSection: ICheckboxFilterSectionStrings;
}

export interface IFilterSelectLocalStrings {
    ApplyFilterButtonLabel: string;
    ApplyFilterButtonAriaDescription: string;
    ClearAllButtonLabel: string;
    ClearAllButtonAriaDescription: string;
    FilterSelectPanelTitle: string;
    FilterSelectPanelTitleWithNumber: string;
}