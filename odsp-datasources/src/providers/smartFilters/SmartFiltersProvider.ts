import { IFilter } from '../../interfaces/view/IViewArrangeInfo';
import { IFilterSectionInfo, IFilterOption } from '../../models/smartFilters/FilterSectionType';
import { FilterSectionType } from '../../models/smartFilters/FilterSectionType';
import * as ViewHelpers from '../../models/view/ViewHelpers';
import * as SmartFiltersHelper from '../../utilities/smartFilters/SmartFiltersHelper';
import ListFilterUtilities from '../../utilities/list/ListFilterUtilities';
import { ISPListItem, ColumnFieldType } from '../../SPListItemProcessor';
import { ISPListContext } from '../../SPListItemRetriever';
import { SPListItemProvider } from '../item/SPListItemProvider';
import { ISPItemSet } from '../../ListItem';
import { IGetItemContextChange, GETITEMCONTEXT_CHANGE } from '../item/DataManager';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface ISmartFiltersProviderParams {
    contextKey: string;
    eventContainer: any;
    listContext: ISPListContext;
    itemProvider: SPListItemProvider;
    parentKey: string;
    strings: SmartFiltersHelper.ISmartFilterStrings;
    getIconUrlFromExtension: (extension: string) => string;
}

export default class SmartFiltersProvider {
    private _contextKey: string;
    private _eventContainer: any;
    private _listContext: ISPListContext;
    private _itemProvider: SPListItemProvider;
    private _parentKey: string;
    private _strings: SmartFiltersHelper.ISmartFilterStrings;
    private _getIconUrlFromExtension: (extension: string) => string;

    constructor(params: ISmartFiltersProviderParams) {
        this._contextKey = params.contextKey;
        this._eventContainer = params.eventContainer;
        this._listContext = params.listContext;
        this._itemProvider = params.itemProvider;
        this._parentKey = params.parentKey;
        this._strings = params.strings;
        this._getIconUrlFromExtension = params.getIconUrlFromExtension;
    }

    public filterBySectionOptions(filterSectionInfo: IFilterSectionInfo) {
        if (!filterSectionInfo || !filterSectionInfo.options || filterSectionInfo.options.length <= 0) {
            return;
        }

        let values: string[] = [];
        for (let option of filterSectionInfo.options) {
            if (option.checked) {
                values.push(...option.values);
            }
        }

        this.filter(filterSectionInfo.fieldName, filterSectionInfo.fieldType, filterSectionInfo.serverFieldType, values);
    }

    public filter(fieldName: string, fieldType: ColumnFieldType, serverFieldType: string, values: string[]) {
        let sectionType = SmartFiltersHelper.getSectionType(fieldType, fieldName);
        let useLookupId = sectionType === FilterSectionType.hierarchy;
        let filter: IFilter = {
            fieldName: fieldName,
            values: values,
            type: serverFieldType,
            operator: serverFieldType.toLowerCase() === 'multichoice' ? 'Eq' : 'In', // MultiChoice column need to use 'Eq' as the operator.
            id: fieldName
        };

        if (useLookupId) {
            filter.lookupId = true;
        }

        this._updateFilter(filter);
    }

    public getFilterSuggestions(fieldName: string, fieldType: ColumnFieldType, beginWith: string): Promise<IFilterOption[]> {
        let currentView = this._listContext.viewResult;
        let viewXmlWithBeginWithFilter = SmartFiltersHelper.getViewXmlWithBeginWithFilter(
            currentView.getEffectiveViewXml(), fieldName, fieldType, beginWith);

        return this._itemProvider.getItemSet({
            parentKey: this._parentKey,
            viewXml: viewXmlWithBeginWithFilter
        }, {
            listId: this._listContext.listId
        }).then((result: ISPItemSet) => {
            const items: ISPListItem[] = result.itemKeys.map((key: string) => this._itemProvider.getItemFromStore(key));
            return SmartFiltersHelper.getFilterOptionsFromItems(
                fieldType,
                fieldName,
                items,
                this._strings,
                (fieldType: ColumnFieldType, display: string, value: string, checked?: boolean) => {
                    return SmartFiltersHelper.getFilterOptionCore({ getIconUrlFromExtension: this._getIconUrlFromExtension },
                        this._strings, fieldType, display, value, checked);
                }
            );
        });
    }

    /**
     * Update filter.
     * Filter values might exist in query string or viewXml.
     * If new filter values are already in the query string, we only need to update query string.
     * If new filter values contains both existing value in the query string and new values,
     * we need to remove all filter values for the current field from query string and
     * move all filter values to viewXml.
     */
    private _updateFilter(filter: IFilter) {
        const currentView = this._listContext.viewResult;
        let queryString = this._listContext.filterParams;
        let filterListInQueryString = this._getFilterListFromQueryString(queryString);
        let filterValuesInQueryString: string[];

        for (let filterInQueryString of filterListInQueryString) {
            if (filterInQueryString.fieldName === filter.fieldName) {
                filterValuesInQueryString = filterInQueryString.values;
                break;
            }
        }

        // update the current view to reflect new filter information
        let moveAllFiltersToView = true;
        // no need to move filters to view if all the filter values are already in query string.
        if (filter.values.length > 0 && filterValuesInQueryString) {
            let allValuesInQuery = true;
            for (let value of filter.values) {
                if (filterValuesInQueryString.indexOf(value) === -1) {
                    allValuesInQuery = false;
                    break;
                }
            }
            if (allValuesInQuery) {
                moveAllFiltersToView = false;
            }
        }

        if (filter.values.length > 0) {
            if (moveAllFiltersToView) {
                ViewHelpers.updateFilter(currentView, filter);
            }
        } else {
            ViewHelpers.removeFilter(currentView, filter.id);
        }

        // trigger context change event to get new filter data
        const args: IGetItemContextChange = {
            key: this._contextKey,
            viewXml: currentView.getEffectiveViewXml()
        };
        EventGroup.raise(this._eventContainer, GETITEMCONTEXT_CHANGE, args, true);
    }

    private _getFilterListFromQueryString(queryString: string): IFilter[] {
        let rawFields = <any[]>(
            (this._listContext && this._listContext.rawListSchema) ?
                this._listContext.rawListSchema.Field :
                null);
        return ListFilterUtilities.getFilterList(queryString, rawFields, true);
    }
}
