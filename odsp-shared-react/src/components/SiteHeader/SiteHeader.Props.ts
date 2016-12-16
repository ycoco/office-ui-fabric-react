import * as React from 'react';
import { SiteHeader } from './SiteHeader';
import { IFacepileProps } from 'office-ui-fabric-react/lib/components/Facepile/index';
import { IGroupCardLinks } from '../GroupCard/GroupCard.Props';
import { IMembersInfoProps } from '../MembersInfo/MembersInfo.Props';
import { IReactDeferredComponentCapability } from '../ReactDeferredComponent/index';

export interface ISiteHeaderProps extends React.Props<SiteHeader>, IReactDeferredComponentCapability {
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
  logoOnClick?: (ev: React.MouseEvent<HTMLElement>) => void;

  /**
   * Logo for the site.
   */
  siteLogo: ISiteLogoInfo;

  /**
   * This will be optionally displayed below the site title.
   */
  groupInfoString?: string;

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

  /**
   * If defined, Facepile information will be rendered as well.
   * @default: null
   */
  facepile?: IFacepileProps;

  /**
   * Determines whether the GroupCard is displayed when the site title is clicked
   */
  showGroupCard?: boolean;

  /**
   * Group links
   */
  groupLinks?: IGroupCardLinks[];

  /**
   * Properties to pass through for MembersInfo
   * */
  membersInfoProps?: IMembersInfoProps;

  /**
   * The boolean indicates if join/leave group feature is enabled.
   * @default: false
   */
  enableJoinLeaveGroup?: boolean;
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

export interface IGoToMembersProps {
  /**
   * What happens when you click members count
   */
  goToMembersAction: (ev: React.MouseEvent<HTMLElement>) => void;
}
