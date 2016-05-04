import * as React from 'react';
import { ISiteHeaderProps } from '../SiteHeader/index';
import { IHorizontalNavProps } from '../HorizontalNav/index';
import { IWithResponsiveModeState } from '@ms/office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import CompositeHeader from './CompositeHeader';

export interface ICompositeHeaderProps extends React.Props<CompositeHeader>, IWithResponsiveModeState {
  /** Properties to pass through for site header */
  siteHeaderProps: ISiteHeaderProps;
  /** Properties to pass through to HorizontalNav */
  horizontalNavProps: IHorizontalNavProps;
  /** Properties for Go To Outlook button */
  goToOutlook: IGoToOutlookProps;
}

export interface IGoToOutlookProps {
  /** String for go to outlook string */
  goToOutlookString: string;
  /** What happens when you click go to Outlook */
  goToOutlookAction: (ev: React.MouseEvent) => void;
}