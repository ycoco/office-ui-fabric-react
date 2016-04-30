import * as React from 'react';
import SiteHeader from './SiteHeader';

export interface ISiteHeaderProps extends React.Props<SiteHeader> {
  /**
   * Name of the site, displayed most prominently in the site header.
   */
  siteTitle: string;

  /**
   * Optional string/URL to display in the <a> around the Site Logo.
   */
  logoHref?: string;

  /**
   * Optional callback function for when the site logo is clicked.
   */
  logoOnClick?: (ev: React.MouseEvent) => void;

  /**
   * Logo for the site.
   */
  siteLogo: ISiteLogoInfo;

  /**
   * This will be optionally displayed below the site title.
   */
  groupInfoString?: string;

  /**
   * Text displaying how many members are part of this site.
   * @default: null
   */
  membersText?: string;

  /**
   * Whether to disable the doughboy site logo fallback if sitelogo property is not set.
   * @default: false
   */
  disableSiteLogoFallback?: boolean;

  /**
   * CSS class to apply to the Site Header.
   * @default null
   */
  className?: string;
}

/**
 * Encapsulates information about the site logo.
 */
export interface ISiteLogoInfo {
  /**
   * Url to site logo image, if there is one.
   */
  siteLogoUrl?: string;

  /**
   * 2-letter acronym used for the site.
   */
  siteAcronym?: string;

  /**
   * Background color for site logo.
   */
  siteLogoBgColor?: string;
}
