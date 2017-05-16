// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { IFilterSectionInfo, IFilterOption } from '@ms/odsp-datasources/lib/models/smartFilters/FilterSectionType';
import './SeeAllLink.scss';
import ListFilterUtilitiesDeferred, { IFilterData } from '@ms/odsp-datasources/lib/utilities/list/ListFilterUtilitiesDeferred';
import { ColumnFieldType } from '@ms/odsp-datasources/lib/SPListItemProcessor';
import * as ObjectUtil from '@ms/odsp-utilities/lib/object/ObjectUtil';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import { getId } from 'office-ui-fabric-react/lib/Utilities';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface ISeeAllLinkProps {
    label: string;
    getOptionFromServerFilterValue: (fieldType: ColumnFieldType, filterData: IFilterData) => IFilterOption;
    getFilterData: (filterField: string, filterFieldType?: ColumnFieldType) => Promise<string>;
    launchFilterSelectPanel: (filterSectionInfo: IFilterSectionInfo) => void;
    filterSectionInfo?: IFilterSectionInfo;
    ariaDescription?: string;
}

export class SeeAllLink extends React.Component<ISeeAllLinkProps, {}> {
    private _ariaDescriptionId: string;
    private _labelId: string;

    constructor(props: ISeeAllLinkProps) {
        super(props);
        this._onClick = this._onClick.bind(this);
        this._ariaDescriptionId = getId('SeeAllLink');
        this._labelId = getId('SeeAllLink');
    }

    public render() {
        let { label, ariaDescription } = this.props;

        // If ariaDescription is given, descriptionId will be assigned to ariaDescriptionSpan,
        // otherwise it will be assigned to descriptionSpan.
        const ariaDescriptionSpan: React.ReactElement<React.HTMLProps<HTMLSpanElement>> = ariaDescription
            ? <span className='ms-accessible' id={ this._ariaDescriptionId }>{ ariaDescription }</span>
            : null;
        const ariaDescriptionId = ariaDescriptionSpan ? this._ariaDescriptionId : null;

        return (
            <a className='SeeAllLink'
                href='#'
                onClick={ this._onClick }
                role='button'
                aria-describedby={ ariaDescriptionId }>
                <span id={ this._labelId } >{ label }</span>
                { ariaDescriptionSpan }
            </a>
        );
    }

    private _onClick(ev: React.MouseEvent<HTMLElement>) {
        let { filterSectionInfo, getOptionFromServerFilterValue, getFilterData, launchFilterSelectPanel } = this.props;
        let newFilterSectionInfo = ObjectUtil.deepCopy(filterSectionInfo);
        getFilterData(newFilterSectionInfo.fieldName, newFilterSectionInfo.fieldType).then((response: any) => {
            let filterValues = ListFilterUtilitiesDeferred.getFilterData(response, newFilterSectionInfo.fieldName);
            let existFilterOptionHash: { [key: string]: IFilterOption } = {};
            for (let option of newFilterSectionInfo.options) {
                existFilterOptionHash[option.key] = option;
            }
            for (let filterValue of filterValues) {
                if (getOptionFromServerFilterValue) {
                    let option = getOptionFromServerFilterValue(filterSectionInfo.fieldType, filterValue);
                    if (existFilterOptionHash[option.key]) {
                        continue;
                    }
                    newFilterSectionInfo.options.push(option);
                }
            }

            launchFilterSelectPanel(newFilterSectionInfo);
        });

        Engagement.logData({ name: 'SeeAll.SmartFiltersPane.Click' });
        ev.stopPropagation();
        ev.preventDefault();
    }
}
