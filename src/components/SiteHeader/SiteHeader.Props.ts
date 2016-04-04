import * as React from 'react';
import SiteHeader from './SiteHeader';

export interface ISiteHeaderProps extends React.Props<SiteHeader> {
  /**
   * Name of the site, displayed most prominently in the site header.
   */
  siteTitle: string;

  /**
   * Logo for the site.
   */
  siteLogo: ISiteLogoInfo;

  /**
   * Site banner.
   * @defaultvalue Purple
   */
  siteBannerThemeClassName: string;

  /**
   * This will be optionally displayed below the site title. test
   */
  groupInfoString?: string;

  /**
   * Text displaying how many members are part of this site.
   */
  membersText?: string;
}

/**
 * Encapsulates information about the site logo.
 */
export interface ISiteLogoInfo {
  /**
   * Url to site logo image, if there is one
   */
  siteLogoUrl?: string;

  /**
   * 2-letter acronym used for the site
   */
  siteAcronym?: string;

  /**
   * Background color for site
   */
  siteBgColor?: string;
}
