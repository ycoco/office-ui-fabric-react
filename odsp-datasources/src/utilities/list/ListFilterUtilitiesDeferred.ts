import ListFilterUtilities from './ListFilterUtilities';

export interface IFilterData {
    value: string;
    display: string;
};

namespace ListFilterUtilitiesDeferred {
    /**
     * Get filter data array returned from server.
     */
    export function getFilterData(filterData: string, filterField: string): IFilterData[] {
        let result: IFilterData[] = [];

        // The filterData sent by the SharePoint server contains a <SELECT>...</SELECT> followed by
        // an <img/> with some onload script that results in script errors in ODN.
        // We only need to use the <SELECT/> node and can ignore the rest.
        filterData = filterData.split("<br>")[0];

        let iframeDoc = document.createElement("DIV");
        iframeDoc.innerHTML = filterData;
        let select = iframeDoc.querySelector("#diidFilter" + filterField);
        if (select != null) {
            // The children of the select tag are the menu items; walk them and create the menu
            let numItems = select.childNodes.length;
            let choices = <any>select.childNodes;

            // Skip index 0 since its "(All)"
            for (let i = 1; i < numItems; i++) {
                let display = ListFilterUtilities.getText(choices[i]);
                let value = choices[i].value.toString();
                result.push({ display: display, value: value });
            }
        }

        return result;
    }
}

export default ListFilterUtilitiesDeferred;