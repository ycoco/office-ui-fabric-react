// OneDrive:IgnoreCodeCoverage

import { ColumnFieldType } from '../../dataSources/item/spListItemProcessor/SPListItemEnums';

/**
 * Custom event names for FiltersPane
 */
export const FiltersPaneEvents = {
    applyPanel: 'filtersPane-applyInPanel',
    pinnedToFiltersPaneChanged: 'filtersPane-pinnedToFiltersPaneChanged',
    showInFiltersPaneChanged: 'filtersPane-showInFiltersPaneChangedChanged',
    sectionInfosChanged: 'filtersPane-sectionInfosChanged'
};

export const enum FilterSectionType {
    /**
     * User type will use PersonaCheckbox to render each option.
     */
    user,

    /**
     * Date type will use single slider to render predefined date range.
     */
    date,

    /**
     * File type will use FileTypeCheckbox to render each option.
     */
    fileType,

    /**
     * Choice type will use normal Checkbox to render each option.
     */
    choice,

    /**
     * Hierarchy type will use CheckboxTree to render section.
     */
    hierarchy
}

export interface IFilterSectionInfo {
    /**
     * Internal name of the field the filter references.
     */
    fieldName: string;

    /**
     * ID or GUID of the field. Different from internal name and use by SharePoint.
     */
    fieldId: string;

    /**
     * Type of the field the filter references.
     */
    fieldType: ColumnFieldType;

    /**
     * Filter Section type.
     */
    type: FilterSectionType;

    /**
     * data type of the field on server side.
     */
    serverFieldType: string;

    /**
     * Filter options.
     */
    options?: IFilterOption[];

    /**
     * Filter section title;
     */
    title?: string;

    /**
     * Whether to show see all link.
     */
    showSeeAllLink?: boolean;

    /**
     * Whether to show filterpicker.
     */
    showFilterPicker?: boolean;

    /**
     * Whether to show edit section button.
     */
    showEditButton?: boolean;

    /**
     * Whether the section info is still loading.
     * This is used for Taxonomy section which require additional server request.
     */
    isLoading?: boolean;
}

export enum DateTimeSliderValue {
    /**
     * Datetime range from oldest time.
     */
    none,

    /**
     * Datetime range from 3 months ago.
     */
    last3Months,

    /**
     * Datetime range from 30 days ago.
     */
    last30Days,

    /**
     * Datetime range from 7 days ago.
     */
    last7Days,

    /**
     * Datetime range from yesterday.
     */
    yesterday,

    /**
     * Datetime range from today.
     */
    today,

    /**
     * DateTime range from tomorrow.
     */
    tomorrow,

    /**
     * Datetime range from 7 days later.
     */
    next7Days,

    /**
     * Datetime range from 30 days later.
     */
    next30Days,

    /**
     * Datetime range from 3 months later.
     */
    next3Months,

    /**
     * Datetime range from a year later.
     */
    nextYear
}

export interface IDateTimeFilterSectionInfo extends IFilterSectionInfo {
    /**
     * Current datetime slider value.
     */
    value?: DateTimeSliderValue;

    /**
     * Min datetime value show in the slider.
     */
    minValue?: DateTimeSliderValue;

    /**
     * Max datetime value show in the slider.
     */
    maxValue?: DateTimeSliderValue;

    /**
     * Slider label.
     */
    label?: string;

    /**
     * Min value label.
     */
    minValueLabel?: string;

    /**
     * Max value label.
     */
    maxValueLabel?: string;

    /**
     * Area label for the datetime slider.
     */
    ariaLabel?: string;
}

export interface IHierachyFilterSectionInfo extends IFilterSectionInfo {
    /**
     * keys for the checked nodes.
     */
    checkedKeys: string[];

    /**
     * keys for the expanded nodes.
     */
    expandedKeys: string[];

    /**
     * values for the checked nodes.
     */
    checkedValues: string[];
}

export interface IFilterOption {
    /**
     * Key to identify filter option.
     */
    key: string;

    /**
     * The corresponding filter values.
     * These are the values to filter by when the option is checked.
     */
    values: string[];

    /**
     * Label to display.
     */
    label: string;

    /**
     * Whether the option is checked or not.
     */
    checked?: boolean;

    /**
     * Icon url for the option
     */
    iconUrl?: string;

    /**
     * Whether the option should always render or not.
     * For example, we always want to render current user option.
     */
    shouldAlwaysRender?: boolean;

    /**
     * Whether this option has child options
     */
    hasChildren?: boolean;

    /**
     * Child options
     */
    children?: IFilterOption[];
}
