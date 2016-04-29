import * as React from 'react';
import { ISiteHeaderProps } from '../SiteHeader/index';
import { IHorizontalNavProps } from '../HorizontalNav/index';

export interface ICompositeHeaderProps {
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