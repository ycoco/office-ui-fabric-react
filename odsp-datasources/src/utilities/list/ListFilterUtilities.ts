import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';

module ListFilterUtilities {
    const FILTER_USE_LOOKUPID_KEY = 'FilterLookupId';
    const FILTER_FIELD_KEY = 'FilterField';
    const FILTER_VALUE_KEY = 'FilterValue';
    const FILTER_TYPE_KEY = 'FilterType';

    export function getFilterFieldByName(queryString: string, fieldName: string): any[] {
        fieldName = UriEncoding.encodeURIComponent(fieldName);
        let arrayField = queryString.match(new RegExp('FilterField([0-9]+)=' + fieldName + '&'));
        if (!Boolean(arrayField)) {
            arrayField = queryString.match(new RegExp('FilterFields([0-9]+)=' + fieldName + '&'));
        }

        return arrayField;
    }

    export function getFilterValueByName(queryString: string, fieldName: string): string {
        fieldName = UriEncoding.encodeURIComponent(fieldName);
        let arrayFilterValues = queryString.match(new RegExp('FilterField([0-9]+)=' + fieldName + '&FilterValue([0-9]+)=([^&]+)'));
        if (!Boolean(arrayFilterValues)) {
            arrayFilterValues = queryString.match(new RegExp('FilterFields([0-9]+)=' + fieldName + '&FilterValues([0-9]+)=([^&]+)'));
        }

        return arrayFilterValues ? decodeURIComponent(arrayFilterValues[arrayFilterValues.length - 1]) : undefined;
    }

    export function getFilterFieldByIndex(queryString: string, index: number): any[] {
        return _getFilterPartByIndex(FILTER_FIELD_KEY, queryString, index);
    }

    export function getFilterValueByIndex(queryString: string, index: number): any[] {
        return _getFilterPartByIndex(FILTER_VALUE_KEY, queryString, index);
    }

    export function getFilterTypeByIndex(queryString: string, index: number): any[] {
        return _getFilterPartByIndex(FILTER_TYPE_KEY, queryString, index);
    }

    export function getFilterUseLookupIdByIndex(queryString: string, index: number): any[] {
        return _getFilterPartByIndex(FILTER_USE_LOOKUPID_KEY, queryString, index);
    }

    // adapted from List_CreateFilterMenu
    export function getFilterParams(queryString: string): string {
        let filterQuery = "";
        let filterNo = 0;
        let arrayField;
        let arrayValue;
        let arrayType;
        do {
            filterNo++;
            arrayField = getFilterFieldByIndex(queryString, filterNo);
            arrayValue = getFilterValueByIndex(queryString, filterNo);
            arrayType = getFilterTypeByIndex(queryString, filterNo);

            if (arrayField !== null && arrayValue !== null) {
                filterQuery += "&" + arrayField.toString() + "&" + arrayValue.toString();
            }

            if (arrayType !== null) {
                filterQuery += "&" + arrayType.toString();
            }
        } while (null != arrayField);

        return filterQuery;
    }

    export function isFiltered(viewParams: { [key: string]: string }): boolean {
        let isFiltered = false;
        for (let key in viewParams) {
            if (key.indexOf("FilterField") === 0) {
                isFiltered = true;
                break;
            }
        }
        return isFiltered;
    }

    export function updateFilterInfo(queryString: string, filterField: string, filterValues: string[], filterType: string, useLookupId?: boolean) {
        // remove the previous filter value from the query string.
        queryString = ListFilterUtilities.addFilterInfo(queryString, filterField, '', true, filterType, useLookupId);

        // add the new filter values into the query string.
        if (filterValues && filterValues.length > 0) {
            let i = 0;
            let filterArray = [];
            do {
                filterArray = getFilterFieldByIndex(queryString, ++i);
            } while (Boolean(filterArray));

            if (queryString !== '') {
                queryString += '&';
            }

            queryString += _convertFilterInfoToString(i, filterField, filterValues, filterType, useLookupId);
        }

        return queryString;
    }

    export function addMultipleFilterInfo(queryString: string, filterField: string[], filterValue: string[]): string {
        let queryWithFilters = queryString;
        filterField.forEach((field: string, index: number) => {
            queryWithFilters = addFilterInfo(queryWithFilters, field, filterValue[index]);
        });
        return queryWithFilters;
    }

    // adapted from List_FilterField
    export function addFilterInfo(queryString: string, filterField: string, filterValue: string, clearField?: boolean, filterType?: string, useLookupId?: boolean): string {
        // Check if filter exists on the current field
        let arrayField = getFilterFieldByName(queryString, filterField);

        if (!Boolean(arrayField)) { // Case 1: doesn't contain filter param for the current field
            let i = 0;
            let filterArray = [];
            do {
                filterArray = getFilterFieldByIndex(queryString, ++i);
            } while (Boolean(filterArray));

            if (!Boolean(clearField)) {
                if (queryString !== '') {
                    queryString += '&';
                }
                queryString += _convertFilterInfoToString(i, filterField, [filterValue], filterType, useLookupId);
            }
        } else { // Case 2: contains filter param for the current field
            let filterNo = parseInt(arrayField[1], 10);
            let arrayValue = getFilterValueByIndex(queryString, filterNo);
            let arrayType = getFilterTypeByIndex(queryString, filterNo);
            let arrayUseLookupId = getFilterUseLookupIdByIndex(queryString, filterNo);
            let strTemp = arrayField[0] + arrayValue[0];
            if (arrayType) {
                strTemp += '&' + arrayType[0];
            }
            if (arrayUseLookupId) {
                strTemp += '&' + arrayUseLookupId[0];
            }
            let exp = strTemp;

            let strNewFilter = '';
            if (!Boolean(clearField)) {
                let exFilterValue = String(arrayValue[0].substr(arrayValue[0].indexOf('=') + 1));

                let newFilterArray = [];
                let fieldValueFound = false;
                let filterValueArray = parseMultiColumnValue(exFilterValue, ';#', true /*shouldDecode*/);
                for (let valueIndex in filterValueArray) {
                    if (valueIndex) {
                        if (filterValueArray[valueIndex] === filterValue) {
                            fieldValueFound = true;
                            continue;
                        }
                        newFilterArray.push(filterValueArray[valueIndex]);
                    }
                }

                if (!fieldValueFound) {
                    newFilterArray.push(filterValue);
                }

                if (newFilterArray.length > 0) {
                    strNewFilter = _convertFilterInfoToString(arrayField[1], filterField, newFilterArray, filterType, useLookupId);
                }
            } else {
                exp = new RegExp('(\\?|\\&)' + strTemp); // remove the preceeding '?' or '&' when clearing filter
            }

            // set filter
            let newQueryString = queryString.replace(exp, strNewFilter);
            if (clearField && newQueryString === queryString) {
                newQueryString = queryString.replace(strTemp, strNewFilter);
            }
            queryString = _restructureFilterUrl(newQueryString, filterNo);
        }

        return queryString;
    }

    /**
     * Get an array of values from a multi-value filter string, replacing ;; with ; in resulting values.
     * If shouldDecode is true, URI decode filterValue before splitting.
     * (this logic follows from URI_ParseMultiColumnValue)
     */
    export function parseMultiColumnValue(filterValue: string, delimiter: string, shouldDecode: boolean): string[] {
        let strLeadingChar = delimiter.charAt(0);
        let strLeadingCharRepeated = strLeadingChar + strLeadingChar;
        let unescapeRegex = new RegExp(strLeadingCharRepeated, 'g');

        if (shouldDecode) {
            filterValue = decodeURIComponent(filterValue);
        }
        let filterArray = filterValue.split(delimiter);
        filterArray = filterArray.map((value: string) => {
            // if the filterValue contains ;; replace it with ;
            return value.replace(unescapeRegex, strLeadingChar);
        });
        return filterArray;
    }

    export function isFieldValueInUrl(queryString: string, filterField: string, filterValue: string, menuText?: string): boolean {
        let arrayField = getFilterFieldByName(queryString, filterField);

        if (Boolean(arrayField)) {
            let filterNo = parseInt(arrayField[1], 10);
            let arrayValue = getFilterValueByIndex(queryString, filterNo);

            let existingfilterValue = String(arrayValue[0].substr(arrayValue[0].indexOf('=') + 1));
            let filterValueArray = decodeURIComponent(existingfilterValue).split(';#');
            for (let valueIndex in filterValueArray) {
                if (filterValueArray[valueIndex] === filterValue || (menuText && filterValueArray[valueIndex] === menuText)) {
                    return true;
                }
            }
        }

        return false;
    }

    export function getText(element: any): string {
        let text = undefined;
        if (Boolean(element.innerText)) {
            text = element.innerText.toString();
        } else if (Boolean(element.textContent)) {
            text = element.textContent.toString();
        } else {
            text = element.innerHTML.toString();
        }
        return text;
    }

    /**
     * Replace ; in filterValues with ;; and encode to construct the query.
     * (this logic follows from URI_ConvertMultiColumnValueToString)
     */
    function _convertMultiColumnValueToString(filterArray: string[], delimiter: string): string {
        let strLeadingChar = delimiter.charAt(0);
        let strLeadingCharRepeated = strLeadingChar + strLeadingChar;
        let escapeRegex = new RegExp(strLeadingChar, 'g');
        filterArray = filterArray.map((filterValue: string) => {
            // if the filterValues contains ; replace it with ;;
            return filterValue.replace(escapeRegex, strLeadingCharRepeated);
        });
        return UriEncoding.encodeURIComponent(filterArray.join(delimiter));
    }

    function _restructureFilterUrl(strDocUrl: string, filterNo: number): string {
        let j = filterNo + 1;

        // Only match for FilterField, if FilterField + int is there,
        // then rename all references
        let filterArray = strDocUrl.match(new RegExp('FilterField' + String(j) + '=[^&]*'));
        let isMultipleFilter = false;
        if (!Boolean(filterArray)) {
            filterArray = strDocUrl.match(new RegExp('FilterFields' + String(j) + '=[^&]*'));
            isMultipleFilter = Boolean(filterArray);
        }

        for (let i = filterNo; Boolean(filterArray); i++) {
            let strNew = isMultipleFilter ? 'FilterFields' + String(i) : 'FilterField' + String(i);
            let strOld = isMultipleFilter ? 'FilterFields' + String(j) : 'FilterField' + String(j);
            strDocUrl = strDocUrl.replace(strOld, strNew);
            strNew = isMultipleFilter ? 'FilterValues' + String(i) : 'FilterValue' + String(i);
            strOld = isMultipleFilter ? 'FilterValues' + String(j) : 'FilterValue' + String(j);
            strDocUrl = strDocUrl.replace(strOld, strNew);
            strNew = isMultipleFilter ? 'FilterTypes' + String(i) : 'FilterType' + String(i);
            strOld = isMultipleFilter ? 'FilterTypes' + String(j) : 'FilterType' + String(j);
            strDocUrl = strDocUrl.replace(strOld, strNew);
            strNew = FILTER_USE_LOOKUPID_KEY + String(i);
            strOld = FILTER_USE_LOOKUPID_KEY + String(j);
            strDocUrl = strDocUrl.replace(strOld, strNew);

            j++;
            filterArray = getFilterFieldByIndex(strDocUrl, j);
        }
        return strDocUrl;
    }

    function _getFilterPartByIndex(partName: string, queryString: string, index: number): any[] {
        let arrayField = queryString.match(new RegExp(partName + String(index) + '=[^&#]*'));
        if (!Boolean(arrayField)) {
            arrayField = queryString.match(new RegExp(partName + 's' + String(index) + '=[^&#]*'));
        }

        return arrayField;
    }

    function _convertFilterInfoToString(filterIndex: number, filterField: string, filterValues: string[], filterType: string, useLookupId?: boolean): string {
        let strFilterField = 'FilterField';
        let strFilterValue = '&FilterValue';
        let strFilterType = '&FilterType';
        if (filterValues.length > 1) {
            strFilterField = 'FilterFields';
            strFilterValue = '&FilterValues';
            strFilterType = '&FilterTypes';
        }

        const exFilterValue = _convertMultiColumnValueToString(filterValues, ';#');
        let result = strFilterField + filterIndex + '=' + filterField + strFilterValue + filterIndex + '=' + exFilterValue;

        if (filterType) {
            result += strFilterType + filterIndex + '=' + filterType;
        }

        if (useLookupId) {
            result += '&' + FILTER_USE_LOOKUPID_KEY + filterIndex + '=1';
        }

        return result;
    }
}

export default ListFilterUtilities;