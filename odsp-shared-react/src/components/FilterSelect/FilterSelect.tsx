// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import {
    autobind,
    BaseComponent,
    css
} from 'office-ui-fabric-react/lib/Utilities';
import {
    Button,
    ButtonType
} from 'office-ui-fabric-react/lib/Button';
import { ColumnFieldType } from '@ms/odsp-datasources/lib/dataSources/item/spListItemProcessor/SPListItemEnums';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { ISPListColumn } from '@ms/odsp-datasources/lib/SPListItemProcessorHelpers';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Features from '@ms/odsp-utilities/lib/features/Features';
import ListFilterUtilitiesDeferred from '@ms/odsp-datasources/lib/utilities/list/ListFilterUtilitiesDeferred';
import { IFilterSectionInfo, IFilterOption, FiltersPaneEvents } from '@ms/odsp-datasources/lib/models/smartFilters/FilterSectionType';
import * as ViewHelpers from '@ms/odsp-datasources/lib/models/view/ViewHelpers';
import * as SmartFiltersHelper from '@ms/odsp-datasources/lib/utilities/smartFilters/SmartFiltersHelper';
import { CheckboxFilterSection } from '../FiltersPane/sections/CheckboxFilterSection';
import './FilterSelect.scss';
import { IFilterSelectProps } from './FilterSelect.Props';

export interface IFilterSelectState {
    isLoading?: boolean;
    filterSectionInfo?: IFilterSectionInfo;
    showBottomLine?: boolean;
}

const ENGAGEMENT_SOURCE = 'SmartFiltersSeeAllPanel';
const FilterPanelTypeAhead = { ODB: 13, ODC: false };

export class FilterSelect extends BaseComponent<IFilterSelectProps, IFilterSelectState> {
    private _columnSchema: ISPListColumn;
    private _eventScope: Object;
    private _filterPanelTypeAheadFeatureEnabled: boolean;
    private _pageContext: ISpPageContext;
    private _scrollRegion: HTMLElement;
    private _stickyFooter: HTMLElement;
    private _checkboxFilterSection: CheckboxFilterSection;

    constructor(props: IFilterSelectProps) {
        super(props);

        this._columnSchema = props.columnSchema;
        this._eventScope = props.dependencies.eventScope;
        this._filterPanelTypeAheadFeatureEnabled = Features.isFeatureEnabled(FilterPanelTypeAhead);
        this._pageContext = props.dependencies.pageContext;

        if (!props.filterSectionInfo && this._columnSchema) {
            let dataSource = props.dependencies.dataSource;
            let filterFieldId = this._columnSchema.internalName || this._columnSchema.key;

            let currentView = props.dependencies.currentView;
            let viewId = currentView && currentView.id;
            let getFilterDataPromise = dataSource.getFilterData(filterFieldId, props.viewParamsString, viewId, this._columnSchema.fieldType);
            this.state = {
                isLoading: true,
                showBottomLine: false,
                filterSectionInfo: props.filterSectionInfo
            };
            getFilterDataPromise.then((response: any) => {
                let filterValues = ListFilterUtilitiesDeferred.getFilterData(response, filterFieldId);
                let options: IFilterOption[] = [];
                let smartFilterInView = currentView ? ViewHelpers.getFilter(currentView, filterFieldId) : undefined;
                let existingFilterValues = smartFilterInView && smartFilterInView.values;
                let filterType = this._columnSchema.fieldType;
                let currentFieldOptionsHash: { [key: string]: { count: number; option: IFilterOption } } = {};

                for (let filterValue of filterValues) {
                    let deps = {
                        getIconUrlFromExtension: props.dependencies.getIconUrlFromExtension
                    };
                    let option = SmartFiltersHelper.getFilterOptionCore(deps, props.strings.smartFilter, filterType, filterValue.display, filterValue.value);
                    if (existingFilterValues && option.values.length > 0) {
                        let optionValue = option.values[0];
                        if (existingFilterValues.indexOf(optionValue) > -1) {
                            option.checked = true;
                        }
                    }

                    if (!currentFieldOptionsHash[option.key]) {
                        options.push(option);
                        currentFieldOptionsHash[option.key] = { count: 1, option: option };
                    }
                }

                let filterSectionInfo: IFilterSectionInfo;
                if (filterType === ColumnFieldType.DateTime) {
                    filterSectionInfo = SmartFiltersHelper.getNewDateTimeFilterSectionInfo(
                        filterFieldId,
                        this._columnSchema.id,
                        filterType,
                        this._columnSchema.name,
                        currentFieldOptionsHash);
                    filterSectionInfo.options = options;
                } else {
                    filterSectionInfo = {
                        fieldName: filterFieldId,
                        fieldId: this._columnSchema.id,
                        fieldType: filterType,
                        type: SmartFiltersHelper.getSectionType(filterType, filterFieldId),
                        serverFieldType: this._columnSchema.serverFieldType,
                        title: SmartFiltersHelper.getSectionTitleCore(props.strings.smartFilter, filterType, this._columnSchema.name),
                        options: options
                    };
                }

                this.setState(
                    {
                        isLoading: false,
                        showBottomLine: false,
                        filterSectionInfo: filterSectionInfo
                    }
                );
            });
        } else {
            this.state = {
                filterSectionInfo: props.filterSectionInfo,
                isLoading: false,
                showBottomLine: false
            };
        }
    }

    public componentDidMount() {
        this._events.on(window, 'resize', this._sizeScrollRegion);
        this._sizeScrollRegion();
    }

    public componentDidUpdate(prevProps: IFilterSelectProps, prevState: IFilterSelectState) {
        if ((prevState.isLoading && !this.state.isLoading) || (prevState.showBottomLine !== this.state.showBottomLine)) {
            this._sizeScrollRegion();
        }
    }

    public render() {
        let { strings } = this.props;
        let { filterSectionInfo, isLoading, showBottomLine } = this.state;
        let showFilterPicker = this._filterPanelTypeAheadFeatureEnabled && filterSectionInfo &&
            (filterSectionInfo.fieldType === ColumnFieldType.Text || filterSectionInfo.fieldType === ColumnFieldType.User);
        let selectedOptionsCount = 0;

        if (!isLoading && filterSectionInfo.options && filterSectionInfo.options.length) {
            for (let option of filterSectionInfo.options) {
                if (option.checked) {
                    selectedOptionsCount++;
                }
            }
        }

        return (!isLoading &&
            <div className='od-FilterSelect-panel' data-automationid='FilterSelect'>
                <div className='od-FilterSelect-region'>
                    <div className='od-FilterSelect-title'>
                    { selectedOptionsCount ?
                        StringHelper.format(strings.filterSelect.FilterSelectPanelTitleWithNumber, filterSectionInfo.title, selectedOptionsCount) :
                        StringHelper.format(strings.filterSelect.FilterSelectPanelTitle, filterSectionInfo.title)
                    }
                    </div>
                    <div className='od-FilterSelect-scrollRegion' ref={ this._resolveRef('_scrollRegion') } >
                        <CheckboxFilterSection
                            ref={ this._resolveRef('_checkboxFilterSection') }
                            className='od-FilterSelect-filterSection'
                            key={ filterSectionInfo.fieldName }
                            strings={ strings.checkboxFilterSection }
                            sectionInfo={ filterSectionInfo }
                            onChange={ this._onChange }
                            engagementSource={ ENGAGEMENT_SOURCE }
                            hideSectionHeader={ true }
                            showFilterPicker={ showFilterPicker }
                            onResolveSuggestions={ this._onResolveSuggestions }
                            onSelectedSuggestionChange={ this._onSelectedSuggestionsChange }
                            pageContext={ this._pageContext }>
                        </CheckboxFilterSection>
                    </div>
                    <div className='od-FilterSelect-stickyFooter' ref={ this._resolveRef('_stickyFooter') }>
                        { showBottomLine && <div className='od-FilterSelect-ruledLine' role='separator' aria-hidden='true'></div> }
                        <div className={ css('od-FilterSelect-buttons', { 'hasRuledLine': showBottomLine }) }>
                            <span className='FilterSelect-buttonContainer'>
                                <Button className='FilterSelect-button'
                                    data-automationid='FilterSelect-Apply'
                                    buttonType={ ButtonType.primary }
                                    onClick={ this._onApplyButtonClick }
                                    ariaDescription={ strings.filterSelect.ApplyFilterButtonAriaDescription }
                                    text={ strings.filterSelect.ApplyFilterButtonLabel } />
                            </span>
                            <span className='FilterSelect-buttonContainer-far'>
                                <Button className='FilterSelect-button'
                                    data-automationid='FilterSelect-ClearAll'
                                    onClick={ this._onClearAllClick }
                                    ariaDescription={ StringHelper.format(strings.filterSelect.ClearAllButtonAriaDescription, filterSectionInfo.title) }
                                    text={ strings.filterSelect.ClearAllButtonLabel } />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    @autobind
    private _sizeScrollRegion() {
        if (this._scrollRegion) {
            let windowHeight: number = window.innerHeight;
            let rectangle = this._scrollRegion.getBoundingClientRect();
            let stickyFooterHeight: number = this._stickyFooter.offsetHeight;
            let visibleHeight: number = windowHeight - rectangle.top - stickyFooterHeight;
            let showBottomLine = false;

            this._scrollRegion.style.maxHeight = visibleHeight.toString() + "px";
            if (rectangle.bottom - rectangle.top > visibleHeight) {
                showBottomLine = true;
            }

            if (this.state.showBottomLine !== showBottomLine) {
                this.setState({ showBottomLine: showBottomLine });
            }
        }
    }

    @autobind
    private _onResolveSuggestions(
        fieldName: string,
        fieldType: ColumnFieldType,
        filterbeginWith: string,
        selectedItems?: IFilterOption[]) {

        let { getFilterSuggestions } = this.props;
        if (getFilterSuggestions) {
            return getFilterSuggestions(fieldName, fieldType, filterbeginWith);
        } else {
            return Promise.wrap([]);
        }
    }

    @autobind
    private _onSelectedSuggestionsChange(fieldName: string, fieldType: ColumnFieldType, selectedOption: IFilterOption) {
        let { filterSectionInfo } = this.state;
        if (!selectedOption) {
            return;
        }

        let sectionInfo = filterSectionInfo;
        let existOption: IFilterOption;
        let focusIndex = -1;

        if (sectionInfo.fieldName === fieldName) {
            for (let i = 0; i < sectionInfo.options.length; i++) {
                let currentOption = sectionInfo.options[i];
                if (selectedOption.key === currentOption.key) {
                    existOption = currentOption;
                    currentOption.checked = true;
                    focusIndex = i;
                    break;
                }
            }

            if (!existOption) {
                selectedOption.checked = true;
                sectionInfo.options.push(selectedOption);
                focusIndex = sectionInfo.options.length - 1;
            }

            this.setState({ filterSectionInfo: sectionInfo }, () => {
                // set focus to the selected option
                this._checkboxFilterSection.resetFocus(focusIndex);
            });
        }
    }

    @autobind
    private _onChange(fieldName: string, fieldType: ColumnFieldType, values: string[]) {
        let { filterSectionInfo } = this.state;

        for (let option of filterSectionInfo.options) {
            let isChecked = false;

            for (let value of option.values) {
                if (values.indexOf(value) >= 0) {
                    isChecked = true;
                    break;
                }
            }

            option.checked = isChecked;
        }

        this.setState({
            filterSectionInfo: filterSectionInfo
        });
    }

    @autobind
    private _onApplyButtonClick() {
        let { onComplete } = this.props;
        let { filterSectionInfo } = this.state;

        if (onComplete) {
            onComplete(filterSectionInfo);
        }

        if (this._eventScope) {
            EventGroup.raise(this._eventScope, FiltersPaneEvents.applyPanel, filterSectionInfo);
        }

        const engagementName = StringHelper.format('ApplyButton.{0}.Click', ENGAGEMENT_SOURCE);
        Engagement.logData({ name: engagementName });
    }

    @autobind
    private _onClearAllClick() {
        let { filterSectionInfo } = this.state;

        for (let option of filterSectionInfo.options) {
            option.checked = false;
        }

        this.setState({
            filterSectionInfo: filterSectionInfo
        });

        const engagementName = StringHelper.format('ClearAllButton.{0}.Click', ENGAGEMENT_SOURCE);
        Engagement.logData({ name: engagementName });
    }
}
