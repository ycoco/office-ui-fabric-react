// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import { IFilterOption, FilterSectionType } from '@ms/odsp-datasources/lib/models/smartFilters/FilterSectionType';
import { PersonaCheckbox } from '../checkboxes/PersonaCheckbox';
import { FileTypeCheckbox } from '../checkboxes/FileTypeCheckbox';
import { ComposedCheckbox } from '../checkboxes/ComposedCheckbox';
import FilterSectionHeader from './FilterSectionHeader';
import { autobind, css, BaseComponent, getId } from 'office-ui-fabric-react/lib/Utilities';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { BasePicker, BasePickerListBelow, IBasePickerProps } from 'office-ui-fabric-react/lib/Pickers';
import { PeoplePicker, PeoplePickerType } from '../../PeoplePicker/index';
import { SeeAllLink } from '../SeeAllLink';
import { ColumnFieldType } from '@ms/odsp-datasources/lib/SPListItemProcessor';
import { format } from '@ms/odsp-utilities/lib/string/StringHelper';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import './CheckboxFilterSection.scss';
import { IFilterSectionProps } from './IFilterSectionProps';

const FilterPicker = BasePickerListBelow as new (props: IBasePickerProps<IFilterOption>) => BasePicker<IFilterOption, IBasePickerProps<IFilterOption>>;
const MAX_OPTION_LENGTH = 5; // maximum number of options show in the filters pane.

export interface ICheckboxFilterSectionStrings {
    NoResults: string;
    NoResultFound: string;
    FilterPickerPlaceholder: string;
    PeoplePickerPlaceholder: string;
    SectionTitleWithNumber: string;
}

export interface ICheckboxFilterSectionProps extends IFilterSectionProps {
    strings: ICheckboxFilterSectionStrings;
    onChange?: (fieldName: string, fieldType: ColumnFieldType, values: string[]) => void;
    showFilterPicker?: boolean;
    onResolveSuggestions?: (
        fieldName: string,
        fieldType: ColumnFieldType,
        filterbeginWith: string,
        selectedItems?: IFilterOption[]
    ) => IFilterOption[] | PromiseLike<IFilterOption[]>;
    onSelectedSuggestionChange?: (fieldName: string, fieldType: ColumnFieldType, selectedOption: IFilterOption) => void;
    pageContext?: ISpPageContext;
    className?: string; //If provided, additional class name to provide on the root element.
}

export class CheckboxFilterSection extends BaseComponent<ICheckboxFilterSectionProps, {}> {
    protected root: HTMLElement;
    protected focusZone: FocusZone;

    private _ariaLabelId: string;
    private _picker: any;

    constructor(props: ICheckboxFilterSectionProps) {
        super(props);
        this._ariaLabelId = getId('CheckboxFilterSection');
    }

    public render() {
        let {
            sectionInfo,
            seeAllLinkProps,
            hideSectionHeader,
            showFilterPicker,
            onResolveSuggestions,
            onSelectedSuggestionChange,
            className,
            commandItems,
            strings
         } = this.props;
        let showSeeAllLink = seeAllLinkProps && (sectionInfo.showSeeAllLink ||
            (sectionInfo.showSeeAllLink !== false && sectionInfo.options && sectionInfo.options.length >= MAX_OPTION_LENGTH));
        let selectedOptionsCount = 0;
        let title = sectionInfo.title;

        if (showSeeAllLink) {
            seeAllLinkProps.filterSectionInfo = sectionInfo;
        }

        if (sectionInfo.options && sectionInfo.options.length) {
            for (let option of sectionInfo.options) {
                if (option.checked) {
                    selectedOptionsCount++;
                }
            }
        }

        if (selectedOptionsCount > 0) {
            title = format(strings.SectionTitleWithNumber, sectionInfo.title, selectedOptionsCount);
        }

        return (
            <div ref={ this._resolveRef('root') } className={ css(className, 'FiltersPane-section') }
                data-automationtype='FilterSection'
                data-section-type={ sectionInfo.type }
                data-section-key={ sectionInfo.fieldName }>
                { !hideSectionHeader &&
                    <FilterSectionHeader
                        rootElementId={ this._ariaLabelId }
                        text={ title }
                        showEditButton={ sectionInfo.showEditButton }
                        commandItems={ commandItems }
                    />
                }
                <div className='FiltersPane-sectionContent' role='group' aria-labelledby={ this._ariaLabelId }>
                    { showFilterPicker && onResolveSuggestions && onSelectedSuggestionChange && this._renderFilterPicker() }
                    { sectionInfo.options && sectionInfo.options.length > 0 &&
                        <FocusZone ref={ this._resolveRef('focusZone') } direction={ FocusZoneDirection.vertical } isCircularNavigation={ true }>
                            { sectionInfo.options.map((option: IFilterOption, index: number) => {
                                // when show see all link, we only show the max number of options.
                                if (!showSeeAllLink || index < MAX_OPTION_LENGTH) {
                                    return this._renderOption(option);
                                }
                            }) }
                        </FocusZone>
                    }
                </div>
                { showSeeAllLink &&
                    <div className='FiltersPane-sectionFooter'>
                        <SeeAllLink { ...seeAllLinkProps }> </SeeAllLink>
                    </div>
                }
            </div>
        );
    }

    @autobind
    public resetFocus(index: number) {
        let { sectionInfo } = this.props;

        if (sectionInfo && sectionInfo.options && sectionInfo.options.length > 0 && index >= 0) {
            let checkbox: HTMLElement = this.root.querySelectorAll('input[type=checkbox]')[Math.min(index, sectionInfo.options.length - 1)] as HTMLElement;
            this.focusZone.focusElement(checkbox);
        }
    }

    @autobind
    private _renderFilterPicker() {
        let { sectionInfo, pageContext, strings } = this.props;
        if (sectionInfo.type === FilterSectionType.user && pageContext) {
            return (
                < PeoplePicker
                    className='od-CheckBoxFilterSection-peoplePicker'
                    context={ pageContext }
                    peoplePickerType={ PeoplePickerType.listBelow }
                    onRenderItem={ this._onRenderItem }
                    onSelectedPersonasChange={ this._onSelectedPersonasChange }
                    inputProps={ { placeholder: strings.PeoplePickerPlaceholder } }
                    noResultsFoundText={ strings.NoResults }
                />
            );
        } else {
            return (
                <FilterPicker
                    className='od-CheckBoxFilterSection-filterPicker'
                    ref={ (picker: any) => { this._picker = picker; } }
                    onResolveSuggestions={ this._onResolveSuggestions }
                    getTextFromItem={ this._getTextFromItem }
                    onRenderItem={ this._onRenderItem }
                    onRenderSuggestionsItem={ this._onRenderSuggestionsItem }
                    pickerSuggestionsProps={ { onRenderNoResultFound: this._onRenderNoResultFound } }
                    inputProps={ { placeholder: strings.FilterPickerPlaceholder } }
                    onChange={ this._onSelectedSuggestionsChange }
                />
            );
        }
    }

    @autobind
    private _onSelectedPersonasChange(items?: IPerson[]) {
        // Only need the last item in the array since it is the last selected suggestion.
        let selectedSuggestion = items && items.length > 0 && items[items.length - 1];

        if (selectedSuggestion) {
            let option = {
                key: selectedSuggestion.name,
                checked: true,
                values: [selectedSuggestion.name],
                label: selectedSuggestion.name,
                iconUrl: selectedSuggestion.image
            };

            this._onSelectedSuggestionsChange([option]);
        }
    }

    @autobind
    private _onRenderNoResultFound() {
        return <div className='od-CheckboxFilterSection-Suggestions-none'>
            { format(this.props.strings.NoResultFound, this._picker.input.value) }
        </div>;
    }

    private _getTextFromItem(filterOption: IFilterOption) {
        return filterOption.label;
    }

    @autobind
    private _onResolveSuggestions(filter: string, selectedItems: IFilterOption[]) {
        let { onResolveSuggestions, sectionInfo } = this.props;
        if (onResolveSuggestions) {
            return onResolveSuggestions(sectionInfo.fieldName, sectionInfo.fieldType, filter, selectedItems);
        }
    }

    private _onRenderItem() {
        return null;
    }

    private _onRenderSuggestionsItem(item: IFilterOption) {
        return <div>{ item.label }</div>;
    }

    @autobind
    private _onSelectedSuggestionsChange(items: IFilterOption[]) {
        let { sectionInfo, onSelectedSuggestionChange } = this.props;

        // Only need the last item in the array since it is the last selected suggestion.
        let selectedSuggestion = items && items.length > 0 && items[items.length - 1];

        if (onSelectedSuggestionChange && selectedSuggestion) {
            onSelectedSuggestionChange(sectionInfo.fieldName, sectionInfo.fieldType, selectedSuggestion);
        }
    }

    @autobind
    private _renderOption(option: IFilterOption) {
        let { sectionInfo } = this.props;
        if (sectionInfo.type === FilterSectionType.user) {
            return (
                <PersonaCheckbox
                    key={ option.key }
                    label={ option.label }
                    imageUrl={ option.iconUrl }
                    onChanged={ this._onToggleChanged }
                    checked={ option.checked }>
                </PersonaCheckbox>
            );
        } else if (sectionInfo.type === FilterSectionType.fileType) {
            return (
                <FileTypeCheckbox
                    key={ option.key }
                    label={ option.label }
                    imageUrl={ option.iconUrl }
                    onChanged={ this._onToggleChanged }
                    checked={ option.checked }>
                </FileTypeCheckbox>
            );
        } else {
            return (
                <ComposedCheckbox
                    key={ option.key }
                    label={ option.label }
                    onChanged={ this._onToggleChanged }
                    checked={ option.checked }
                    showLabel={ true }>
                </ComposedCheckbox>
            );
        }
    }

    @autobind
    private _onToggleChanged(id: string, isChecked: boolean) {
        let { sectionInfo, onChange, engagementSource } = this.props;
        let values: string[] = [];

        for (let option of sectionInfo.options) {
            let newIsChecked = option.checked;
            if (option.key === id) {
                newIsChecked = isChecked;
            }

            if (newIsChecked) {
                for (let value of option.values) {
                    values.push(value);
                }
            }
        }

        if (onChange) {
            onChange(sectionInfo.fieldName, sectionInfo.fieldType, values);
        }

        engagementSource = engagementSource ? engagementSource : 'SmartFiltersPane';
        const engagementName = format('{0}Checkbox.{1}.Click', ColumnFieldType[sectionInfo.fieldType], engagementSource);

        Engagement.logData({
            name: engagementName,
            extraData: {
                isChecked: isChecked
            }
        });
    }
}
