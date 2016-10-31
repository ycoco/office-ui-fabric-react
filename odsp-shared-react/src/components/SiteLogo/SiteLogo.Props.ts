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
  logoOnClick?: (ev: React.MouseEvent<HTMLElement>) => void;

  /**
   * Optional string/URL to display in the <a> around the Site Logo.
   */
  logoHref?: string;

  /**
   * This will be optionally displayed below the site title.
   */
  groupInfoString?: string;

  /**
   * Size override for logo. A style property that will be used to specify width and height and font-size properties.
   * Units are pixels.
   */
  size?: number;

  /**
   * Specifies whether the logo has rounded corners. If size is specified, then the border-radius will be size/2.
   * If size is not specified, then border-radius will be hard-coded to 15px;
   * @default false
   */
  roundedCorners?: boolean;

}
