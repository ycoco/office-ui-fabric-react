// OneDrive:IgnoreCodeCoverage

import { IFilterSectionInfo } from '@ms/odsp-datasources/lib/models/smartFilters/FilterSectionType';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { ISeeAllLinkProps } from '../SeeAllLink';

export interface IFilterSectionProps {
    sectionInfo: IFilterSectionInfo;
    seeAllLinkProps?: ISeeAllLinkProps;
    engagementSource?: string;
    hideSectionHeader?: boolean;
    commandItems?: IContextualMenuItem[];
}

export default IFilterSectionProps;
