import * as React from 'react';
import { ColumnFieldType } from '@ms/odsp-datasources/lib/dataSources/item/spListItemProcessor/SPListItemEnums';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { FilterSelect } from '../../../../FilterSelect';
import './FilterSelect.Basic.Example.scss';
import Async from '@ms/odsp-utilities/lib/async/Async';
import { IFilterSectionInfo } from '@ms/odsp-datasources/lib/models/smartFilters/FilterSectionType';

const mockFilterData= '<DIV ALIGN=RIGHT class="ms-numHeader"><SELECT id="diidFilter_x0074_lj1" TITLE="Filter by Number" OnChange=\'FilterField("{7A0E8792-9B9C-4D96-8F8D-F145E9416837}","\u00255fx0074\u00255flj1",this.options[this.selectedIndex].value, this.selectedIndex);\' dir=""><OPTION  SELECTED Value="">(All)</OPTION><OPTION Value="5.00000000000000" >5</OPTION><OPTION Value="15.0000000000000" >15</OPTION></SELECT><br><a id="diidSort_x0074_lj1" onfocus="OnFocusFilter(this)" class="ms-headerSortTitleLink" title="Sort by Number" href="javascript:" onclick="javascript:return OnClickFilter(this,event);"  SortingFields="SortField=%5fx0074%5flj1&amp;SortDir=Asc&amp;View=%7b7A0E8792%2d9B9C%2d4D96%2d8F8D%2dF145E9416837%7d">Number<img src="/_layouts/15/images/blank.gif?rev=44" class="ms-hidden" border="0" width="1" height="1" alt="Use SHIFT+ENTER to open the menu (new window)."/></a><img src="/_layouts/images/blank.gif" alt="" data-accessibility-nocheck="true" border="0"/><img src="/_layouts/images/blank.gif" border="0" alt="" data-accessibility-nocheck="true"/></DIV>';

export class FilterSelectBasicExample extends React.Component<any, any> {
  constructor() {
    super();
  }

  public render() {
    function getFilterData(filterField: string, queryString: string, viewId: string, filterFieldType?: ColumnFieldType): Promise<any> {
        let async = new Async(this);
        let onExecute = (complete: any, error: any) => {
            async.setTimeout(() => {
                complete(mockFilterData);
            }, 10);
        };
        return new Promise<any>(onExecute);
    }

    let dependencies = {
      getIconUrlFromExtension: (extension: string) => { return ''; },
      dataSource: {
        getFilterData: getFilterData
      }
    };

    let strings = {
        filterSelect: {
          ApplyFilterButtonAriaDescription: 'Apply filter',
          ApplyFilterButtonLabel: 'Apply filter',
          ClearAllButtonAriaDescription: 'Clear all',
          ClearAllButtonLabel: 'Clear all',
          FilterSelectPanelTitle: 'Filter',
          FilterSelectPanelTitleWithNumber: 'Filter',
        },
        smartFilter: {
          OtherFileTypeOption: 'Other',
          EmptyFilterOptionLabel: 'Empty',
          FileTypeFilterSectionTitle: 'Type'
        },
        checkboxFilterSection: {
          NoResults: 'NoResults',
          NoResultFound: 'NoResultFound',
          FilterPickerPlaceholder: 'FilterPickerPlaceholder',
          PeoplePickerPlaceholder: 'PeoplePickerPlaceholder',
          SectionTitleWithNumber: 'SectionTitleWithNumber'
        }
    };

    let columnSchema = {
      key: '0',
      name: 'Test Field Name',
      id: '0',
      serverFieldType: 'number',
      fieldType: ColumnFieldType.Number,
      internalName: '_x0074_lj1'
    } as any;

    return (
      <div className='ms-FilterSelect-container'>
        <FilterSelect
          dependencies={ dependencies }
          strings={ strings }
          viewParamsString={ '' }
          columnSchema={ columnSchema }
          onComplete={ (filterSectionInfo: IFilterSectionInfo) => {
            let checkedOptions = filterSectionInfo.options.filter((option) => option.checked);
            let checkedValues = checkedOptions && checkedOptions.length > 0 ?
              checkedOptions.map((checked) => checked.label).join(','):
              'none';
            alert('Filtered by ' + checkedValues);
            return {};
          }}
        />
      </div>
    );
  }
}
