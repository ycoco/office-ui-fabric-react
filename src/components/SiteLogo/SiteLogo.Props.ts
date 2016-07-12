import * as React from 'react';
import { SiteLogo } from './SiteLogo';

/**
 * Encapsulates information about the site logo.
 */
export interface ISiteLogo extends React.Props<SiteLogo> {

  /**
   * Name of the site
   */
  siteTitle: string;

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

  /**
   * Whether to disable the doughboy site logo fallback if sitelogo property is not set.
   * @default: false
   */
  disableSiteLogoFallback?: boolean;

  /**
   * Optional callback function for when the site logo is clicked.
   */
  logoOnClick?: (ev: React.MouseEvent) => void;

  /**
   * Optional string/URL to display in the <a> around the Site Logo.
   */
  logoHref?: string;

  /**
   * This will be optionally displayed below the site title.
   */
  groupInfoString?: string;

}
