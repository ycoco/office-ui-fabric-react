// OneDrive:CoverageThreshold(80)

import { IFilter } from '../../interfaces/view/IViewArrangeInfo';
import * as CamlUtilities from '../caml/CamlUtilities';
import * as ObjectUtil from '@ms/odsp-utilities/lib/object/ObjectUtil';
import { ShowInFiltersPaneStatus } from '../../dataSources/item/spListItemProcessor/SPListItemEnums';
import { ColumnFieldType } from '../../SPListItemProcessor';
import { ISPListColumn } from '../../SPListItemProcessorHelpers';
import Features from '@ms/odsp-utilities/lib/features/Features';
import {
    DateTimeSliderValue,
    IFilterSectionInfo,
    IFilterOption,
    FilterSectionType,
    IDateTimeFilterSectionInfo,
    IHierachyFilterSectionInfo
} from '../../models/smartFilters/FilterSectionType';
import OfficeFileNameHelper = require('@ms/odsp-utilities/lib/icons/OfficeFileNameHelper');
import View from '../../models/view/View';
import * as ViewHelpers from '../../models/view/ViewHelpers';

const RenderHierarchyInFiltersPane = { ODB: 108 };
const DEBUG: boolean = false;
const USER_PHOTO_URL = "/_layouts/15/userphoto.aspx?size=S&accountname=";

export const MODIFIED_FIELD_NAME = 'Modified';
export const ENTERPRICE_KEYWORD_INTERNAL_NAME = 'TaxKeyword';

export interface IColumnInfo {
    fieldType: ColumnFieldType;
    uniqueValueCount: number;
    totalCount: number;
    displayName: string;
    isRequired: boolean;
    priority: number;
    columnDefinition: ISPListColumn;
    isSelected?: boolean;
    pinnedToFiltersPane?: boolean;
    showInFiltersPane?: ShowInFiltersPaneStatus;
    isConfiguredMetadataNavSetting?: boolean;
}

/**
 * Based on the user field value returned by RenderListDataAsStream
 */
export interface IUser {
    title: string;
    email: string;
    picture: string;
    id: string;
}

export interface ISmartFilterStrings {
    OtherFileTypeOption: string;
    EmptyFilterOptionLabel: string;
    FileTypeFilterSectionTitle: string;
}

export interface ISmartFilterDependencies {
    getIconUrlFromExtension: (extension: string) => string;
}

/**
 * Get filter option from raw filter information
 */
export function getFilterOptionCore(
    dependencies: ISmartFilterDependencies,
    strings: ISmartFilterStrings,
    fieldType: ColumnFieldType,
    display: string,
    value: string,
    checked?: boolean): IFilterOption {
    let iconUrl: string;
    let label = display;
    let values = [value];

    if (fieldType === ColumnFieldType.FileIcon) {
        let extension = value;
        let mapApp = OfficeFileNameHelper.OfficeIconFileTypeMap[extension];

        // Special case pdf, because it's mapped to word but we want to show it as pdf but not word.
        if (extension && extension.toLowerCase() === "pdf") {
            mapApp = undefined;
        }

        if (mapApp) {
            values = OfficeFileNameHelper.OfficeAppToExtensionsMap[mapApp];
            mapApp = OfficeFileNameHelper.getOfficeAppFriendlyName(mapApp);
        }

        label = mapApp || extension || strings.OtherFileTypeOption;
        iconUrl = dependencies.getIconUrlFromExtension(extension);
    } else if (label === undefined) {
        label = normalizeFilterDisplayString(fieldType, value);
        values = [normalizeFilterValue(fieldType, value)];
    }

    label = label || strings.EmptyFilterOptionLabel;

    return {
        key: label,
        checked: checked ? true : false,
        values: values,
        label: label,
        iconUrl: iconUrl
    };
}

/**
 * Get filter section type based on the column field type.
 */
export function getSectionType(fieldType: ColumnFieldType, fieldName: string): FilterSectionType {
    if (fieldType === ColumnFieldType.Taxonomy &&
        Features.isFeatureEnabled(RenderHierarchyInFiltersPane) &&
        fieldName !== ENTERPRICE_KEYWORD_INTERNAL_NAME) {
        return FilterSectionType.hierarchy;
    }

    switch (fieldType) {
        case ColumnFieldType.User:
            return FilterSectionType.user;
        case ColumnFieldType.DateTime:
            return FilterSectionType.date;
        case ColumnFieldType.FileIcon:
            return FilterSectionType.fileType;
        default:
            return FilterSectionType.choice;
    }
}

/**
 * Get section title based on field type and name.
 */
export function getSectionTitleCore(strings: { FileTypeFilterSectionTitle: string }, fieldType: ColumnFieldType, fieldName: string): string {
    if (fieldType === ColumnFieldType.FileIcon) {
        // fileIcon field name is empty string, we need to make sure it show correct title.
        return strings.FileTypeFilterSectionTitle;
    } else {
        return fieldName;
    }
}

/**
 * Update section infos based on the input filters array.
 */
export function updateSectionInfosCore(
    dependencies: ISmartFilterDependencies,
    strings: ISmartFilterStrings,
    sectionInfos: IFilterSectionInfo[],
    filters: IFilter[],
    columnInfoHash: { [fieldName: string]: IColumnInfo },
    fieldOptionsHash: { [fieldName: string]: { [key: string]: { count: number; option: IFilterOption } } }) {
    if (!filters || filters.length < 1 || !sectionInfos) {
        return;
    }
    for (let filter of filters) {
        const columnInfo = columnInfoHash[filter.fieldName];
        let existSection: IFilterSectionInfo;

        for (let section of sectionInfos) {
            if (section.fieldName === filter.fieldName) {
                existSection = section;
                break;
            }
        }

        if (existSection) {
            if (existSection.type === FilterSectionType.date) {
                let sliderValue = _getSliderValueFromFilter(filter);

                if (sliderValue !== undefined) {
                    (existSection as IDateTimeFilterSectionInfo).value = sliderValue;
                }
            } else if (existSection.type === FilterSectionType.hierarchy && !existSection.isLoading) {
                (existSection as IHierachyFilterSectionInfo).checkedValues = filter.values;
            }

            for (let optionValue of filter.values) {
                if (existSection.type === FilterSectionType.hierarchy && optionValue === '0') {
                    // For taxonomy term, if it is never used in the list item, the value for the term is always be '0'.
                    // '0' value is not unique value for a term, we cannot use it to find the match option.
                    continue;
                }

                let matchOption;

                if (!existSection.options) {
                    existSection.options = [];
                }

                for (let option of existSection.options) {
                    if (_matchOptionValue(option, optionValue)) {
                        matchOption = option;
                        break;
                    }
                }

                if (matchOption) {
                    matchOption.checked = true;
                    if (existSection.type === FilterSectionType.hierarchy && !existSection.isLoading) {
                        const existHierachySection = (existSection as IHierachyFilterSectionInfo);
                        if (existHierachySection.checkedKeys.indexOf(matchOption.key) === -1) {
                            existHierachySection.checkedKeys.push(matchOption.key);
                        }
                    }
                } else {
                    if ((existSection.type === FilterSectionType.date && CamlUtilities.isTodayString(optionValue)) || existSection.type === FilterSectionType.hierarchy) {
                        continue;
                    }

                    let newOption = getFilterOptionCore(dependencies, strings, columnInfo.fieldType, undefined, optionValue, true);
                    existSection.options.push(newOption);
                }
            }
        } else {
            const filterOptions: IFilterOption[] = [];
            let newSectionInfo: IFilterSectionInfo | IDateTimeFilterSectionInfo;
            for (let value of filter.values) {
                let newOption = getFilterOptionCore(dependencies, strings, columnInfo.fieldType, undefined, value, true);
                filterOptions.push(newOption);
            }

            if (columnInfo.fieldType === ColumnFieldType.DateTime) {
                newSectionInfo = getNewDateTimeFilterSectionInfo(
                    filter.fieldName,
                    columnInfo.columnDefinition.id,
                    columnInfo.fieldType,
                    columnInfo.displayName,
                    fieldOptionsHash[filter.fieldName]);
                let sliderValue = _getSliderValueFromFilter(filter);
                if (sliderValue !== undefined) {
                    (newSectionInfo as IDateTimeFilterSectionInfo).value = sliderValue;
                }
                newSectionInfo.options = filterOptions;
            } else {
                newSectionInfo = {
                    fieldName: filter.fieldName,
                    fieldId: columnInfo.columnDefinition.id,
                    fieldType: columnInfo.fieldType,
                    type: getSectionType(columnInfo.fieldType, filter.fieldName),
                    serverFieldType: columnInfo.columnDefinition.serverFieldType,
                    title: columnInfo.displayName,
                    options: filterOptions,
                    showSeeAllLink: true
                };
            }

            sectionInfos.push(newSectionInfo);
        }
    }
}

/**
 * Get new datetime slider section info.
 */
export function getNewDateTimeFilterSectionInfo(
    fieldName: string,
    fieldId: string,
    fieldType: ColumnFieldType,
    fieldDisplayName: string,
    currentFieldOptionsHash: { [key: string]: { count: number; option: IFilterOption } }): IDateTimeFilterSectionInfo {

    let sectionInfo: IDateTimeFilterSectionInfo = {
        fieldName: fieldName,
        fieldId: fieldId,
        fieldType: fieldType,
        type: FilterSectionType.date,
        serverFieldType: 'DateTime',
        title: fieldDisplayName,
        value: DateTimeSliderValue.none,
        minValueLabel: _getMinDateValue(currentFieldOptionsHash),
        maxValueLabel: _getMaxDateValue(),
        maxValue: DateTimeSliderValue.nextYear,
        showSeeAllLink: true,
        options: []
    };

    if (fieldName === MODIFIED_FIELD_NAME) {
        sectionInfo.maxValue = DateTimeSliderValue.today;
    }

    return sectionInfo;
}

/**
 * Normalize filter display string to remove trailing 0 or convert to fix number of digits after decimal.
 * @example '4.00000' will be normalized as return '4' when field type is number.
 * '3.5000' will be normalized as return '3.50' when field type is rating.
 */
export function normalizeFilterDisplayString(fieldType: ColumnFieldType, display: string): string {
    let normalizedValue: string;

    if (fieldType === ColumnFieldType.Number || fieldType === ColumnFieldType.AverageRating) {
        let digits = fieldType === ColumnFieldType.AverageRating ? 2 : undefined;
        normalizedValue = _normalizeNumberFilterDisplay(display, digits);
    } else if (fieldType === ColumnFieldType.DateTime) {
        // TODO: need to get shortDateTimePattern from contextInfo. We will update when server change is available.
        // We want to convert 'yyyy-mm-dd' filter display string to the corresponding shortDateTimePattern. such as 'mm/dd/yyyy'
        let parts = display.split('-');
        if (parts && parts.length === 3 && parts[0].length === 4) {
            let year = parseInt(parts[0], 10);
            let month = parseInt(parts[1], 10);
            let day = parseInt(parts[2], 10);

            normalizedValue = month + '/' + day + '/' + year;
        }
    }

    if (normalizedValue === undefined) {
        normalizedValue = display;
    }

    return normalizedValue;
}

/**
 * Normalize filter value.
 * @example '$12,00.00' will be normalized to '1200.00'
 */
export function normalizeFilterValue(fieldType: ColumnFieldType, value: string): string {
    if (fieldType === ColumnFieldType.Currency) {
        value = value.replace(/[^0-9\.]+/g, '');
    }

    return value;
}

export function addOrUpdateSectionInfo(sectionInfos: IFilterSectionInfo[], newSectionInfo: IFilterSectionInfo, maxOptionCount: number) {
    let existSectionIndex: number;

    for (let i = 0; i < sectionInfos.length; i++) {
        if (sectionInfos[i].fieldName === newSectionInfo.fieldName) {
            existSectionIndex = i;
            break;
        }
    }

    let newOptions: IFilterOption[];
    let newOptionsHash: { [key: string]: IFilterOption } = {};
    if (newSectionInfo.options && newSectionInfo.options.length > 0) {
        newOptions = [];
        for (let i = 0; i < newSectionInfo.options.length; i++) {
            let option = newSectionInfo.options[i];

            if (option.shouldAlwaysRender) {
                // when option has shouldAlwaysRender set to true, we always put it at the begining of the array.
                newOptions.splice(0, 0, option);
                newOptionsHash[option.key] = option;
            } else if (option.checked) {
                newOptions.push(option);
                newOptionsHash[option.key] = option;
            }
        }

        if (newOptions.length < maxOptionCount) {
            let previousOptions = existSectionIndex >= 0 ? sectionInfos[existSectionIndex].options : newSectionInfo.options;
            for (let previousOption of previousOptions) {
                if (!newOptionsHash[previousOption.key]) {
                    // all the options we back fill in should be unchecked.
                    // since all the user checked options from the panel is in newOptions.
                    previousOption.checked = false;
                    newOptions.push(previousOption);
                    newOptionsHash[previousOption.key] = previousOption;
                    if (newOptions.length >= maxOptionCount) {
                        break;
                    }
                }
            }
        }
    }

    let sectionInfoUpdateTo = ObjectUtil.deepCopy(newSectionInfo);
    sectionInfoUpdateTo.options = newOptions;
    if (existSectionIndex >= 0) {
        sectionInfos[existSectionIndex] = sectionInfoUpdateTo;
    } else {
        sectionInfos.push(sectionInfoUpdateTo);
    }
}

export function getViewXmlWithBeginWithFilter(currentViewXml: string, fieldName: string, fieldType: ColumnFieldType, beginWith: string): string {
    let view = new View(currentViewXml);
    let type: string;
    switch (fieldType) {
        case ColumnFieldType.User:
            type = 'Lookup';
            break;
        case ColumnFieldType.FileIcon:
            type = 'Computed';
            break;
        case ColumnFieldType.Choice:
            type = 'Choice';
            break;
        case ColumnFieldType.DateTime:
            type = 'DateTime';
            break;
        default:
            type = 'Text';
            break;
    }

    let beginWithFilter: IFilter = {
        fieldName: fieldName,
        values: [beginWith],
        type: type,
        operator: 'BeginsWith',
        id: fieldName
    };

    ViewHelpers.updateFilter(view, beginWithFilter);

    return view.getEffectiveViewXml();
}

export function getFilterOptionsFromItems(
    fieldType: ColumnFieldType,
    fieldName: string,
    items: { properties?: { [key: string]: any } }[],
    strings: { EmptyFilterOptionLabel: string },
    getFilterOption: (fieldType: ColumnFieldType, display: string, value: string, checked?: boolean) => IFilterOption): IFilterOption[] {

    let optionsMap: { [key: string]: IFilterOption } = {};
    for (let item of items) {
        if (!item) {
            continue;
        }

        let options = getFilterOptionsFromItem(fieldType, fieldName, item.properties, strings, getFilterOption);
        for (let option of options) {
            if (!optionsMap[option.key]) {
                optionsMap[option.key] = option;
            }
        }
    }

    let suggestions: IFilterOption[] = [];
    for (let key in optionsMap) {
        if (optionsMap.hasOwnProperty(key)) {
            suggestions.push(optionsMap[key]);
        }
    }

    return suggestions;
}


export function getFilterOptionsFromItem(
    fieldType: ColumnFieldType,
    fieldName: string,
    itemProperties: { [key: string]: any },
    strings: { EmptyFilterOptionLabel: string },
    getFilterOption: (fieldType: ColumnFieldType, display: string, value: string, checked?: boolean) => IFilterOption): IFilterOption[] {
    let value = itemProperties[fieldName];
    let filterOptions: IFilterOption[] = [];

    if (fieldType === ColumnFieldType.FileIcon) {
        value = itemProperties['File_x0020_Type'];
    }

    if (value !== undefined && value !== null) {
        if (fieldType === ColumnFieldType.User) {
            let users = value as IUser[] || [];

            for (let user of users) {
                let iconUrl = USER_PHOTO_URL + user.email;
                let label = user.title || strings.EmptyFilterOptionLabel;
                filterOptions.push({ key: label, values: [user.title], iconUrl: iconUrl, label: label });
            }
        } else if ((fieldType === ColumnFieldType.Lookup) && Array.isArray(value)) {
            // lookup column value is special, it can be string, array of lookup data or empty array.
            if (value.length > 0) {
                for (let lookup of value) {
                    let option = getFilterOption(fieldType, undefined, lookup.lookupValue);
                    filterOptions.push(option);
                }
            } else {
                let option = getFilterOption(fieldType, undefined, '');
                filterOptions.push(option);
            }
        } else if (fieldType === ColumnFieldType.Boolean) {
            // for boolean type, value is stored in fieldName.value while display string is stored in fieldName.
            let option = getFilterOption(fieldType, value, itemProperties[fieldName + '.value']);
            filterOptions.push(option);
        } else if (fieldType === ColumnFieldType.Taxonomy && value) {
            //for single value managed metadata field, property value is not an array
            if (!(value instanceof Array)) {
                value = [value];
            }

            if (value.length > 0) {
                for (let term of value) {
                    let option = getFilterOption(fieldType, undefined, term.Label);
                    filterOptions.push(option);
                }
            } else {
                // empty array means empty term.
                let option = getFilterOption(fieldType, undefined, '');
                filterOptions.push(option);
            }
        } else if (fieldType === ColumnFieldType.Currency || fieldType === ColumnFieldType.Number) {
            let rawValuePropertyName = fieldName + '.';
            let option: IFilterOption;
            if (itemProperties[rawValuePropertyName] !== undefined) {
                option = getFilterOption(fieldType, value, itemProperties[rawValuePropertyName]);
            } else {
                option = getFilterOption(fieldType, undefined, value);
            }

            filterOptions.push(option);
        } else {
            const valueArray = !(value instanceof Array) ? [value] : value;

            if (valueArray.length > 0) {
                for (let singleValue of valueArray) {
                    let option = getFilterOption(fieldType, undefined, singleValue);
                    filterOptions.push(option);
                }
            }
        }
    }

    return filterOptions;
}

/**
 *  Get minimum year from dictionary of date options.
 */
function _getMinDateValue(hash: { [key: string]: { count: number; option: IFilterOption } }): string {
    let minDate: Date;
    for (let key in hash) {
        //TODO: this will fail when the user’s profile locale uses dd/mm/yyyy rather than mm/dd/yyyy.
        // need to add method in odsp-utilities DateTime helper to get the Date.
        try {
            let date = new Date(key);
            if (!isNaN(date.getTime()) && (!minDate || minDate > date)) {
                minDate = date;
            }
        } catch (e) {
            if (DEBUG) {
                console.log(e.toString());
            }
        }
    }

    return minDate && minDate.getFullYear().toString();
}

/**
 *  Get next year string from now.
 */
function _getMaxDateValue(): string {
    let nextYear = (new Date()).getFullYear() + 1;
    return nextYear + '+';
}

/**
 * Normalize number filter display.
 *
 * @private
 * @param {string} display. This is string represents a number.
 * @param {number} [digits] The number of digits to appear after the decimal point;
 * if it is not providered, trimming all the tailing 0.
 * @returns {string}
 * @example _normalizeNumberFilterDisplay('1.20000') return '1.2'
 * _normalizeNumberFilterDisplay('1.20000', 2) return '1.20'
 */
function _normalizeNumberFilterDisplay(display: string, digits?: number): string {
    let result: string;

    if (!display) {
        return display;
    }

    try {
        const number = parseFloat(display);

        if (!isNaN(number)) {
            result = digits === undefined ? number.toString() : number.toFixed(digits);
        }

    } catch (e) {
        if (DEBUG) {
            console.log(e.toString());
        }
    }

    return result;
}

/**
 *  Get the date only part from a date object.
 */
function _getDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 *  Convert filter value to DateTimeSliderValue.
 */
function _getSliderValueFromFilter(filter: IFilter): DateTimeSliderValue {
    let resultValue: DateTimeSliderValue;
    let dateFilterValue = filter.values && filter.values.length > 0 && filter.values[0];
    let offset = CamlUtilities.isTodayString(dateFilterValue) && CamlUtilities.getTodayOffset(dateFilterValue);

    if (offset !== undefined) {
        // this means the filter is using today with offset
        resultValue = _getSliderValueFromTodayOffset(offset);
    } else {

        // get min slider value from filter values.
        for (let value of filter.values) {
            let sliderValue = _getDateTimeSliderValue(value);
            if (resultValue === undefined) {
                resultValue = sliderValue;
            } else {
                resultValue = Math.min(resultValue, sliderValue);
            }
        }
    }

    return resultValue;
}

/**
 *  Convert single datetime value to DateTimeSliderValue.
 */
function _getDateTimeSliderValue(dateValue: string): DateTimeSliderValue {
    let sliderValue = DateTimeSliderValue.none;

    try {
        let timeValues = dateValue.split(/[^0-9]/); // dateValue in query string has format like 1999-12-31
        let date = new Date(Number(timeValues[0]), Number(timeValues[1]) - 1, Number(timeValues[2]));
        let millisecondsPerDay = 24 * 60 * 60 * 1000;
        let now = _getDateOnly(new Date());
        let daysDiff = Math.round((date.getTime() - now.getTime()) / millisecondsPerDay);

        sliderValue = _getSliderValueFromTodayOffset(daysDiff);
    } catch (e) {
        if (DEBUG) {
            console.log(e.toString());
        }
    }

    return sliderValue;
}

/**
 *  Convert today offset number to DateTimeSliderValue.
 */
function _getSliderValueFromTodayOffset(offset: number): DateTimeSliderValue {
    let sliderValue: DateTimeSliderValue;

    if (offset === 0) {
        sliderValue = DateTimeSliderValue.today;
    } else if (offset === -1) {
        sliderValue = DateTimeSliderValue.yesterday;
    } else if (offset < -1 && offset >= -7) {
        sliderValue = DateTimeSliderValue.last7Days;
    } else if (offset < -7 && offset >= -30) {
        sliderValue = DateTimeSliderValue.last30Days;
    } else if (offset < -30 && offset >= -92) {
        sliderValue = DateTimeSliderValue.last3Months;
    } else if (offset >= 1 && offset < 7) {
        sliderValue = DateTimeSliderValue.tomorrow;
    } else if (offset >= 7 && offset < 30) {
        sliderValue = DateTimeSliderValue.next7Days;
    } else if (offset >= 30 && offset < 92) {
        sliderValue = DateTimeSliderValue.next30Days;
    } else if (offset >= 92 && offset < 365) {
        sliderValue = DateTimeSliderValue.next3Months;
    } else if (offset >= 365) {
        sliderValue = DateTimeSliderValue.nextYear;
    } else {
        sliderValue = DateTimeSliderValue.none;
    }

    return sliderValue;
}

/**
 * Return whether the input value match the option filter value.
 */
function _matchOptionValue(option: IFilterOption, matchValue: string): boolean {
    let result = false;

    try {
        let regex = /^-?\d+(?:[.,]\d*?)?$/; // regex for float or number.
        if (regex.test(matchValue)) {
            let parsedMatchValue = parseFloat(matchValue);
            if (!isNaN(parsedMatchValue)) {
                for (let value of option.values) {
                    if (parsedMatchValue === parseFloat(value)) {
                        result = true;
                        break;
                    }

                }
            }
        } else {
            result = option.values.indexOf(matchValue) >= 0;
        }
    } catch (e) {
        if (DEBUG) {
            console.log(e.toString());
        }
    }

    return result;
}