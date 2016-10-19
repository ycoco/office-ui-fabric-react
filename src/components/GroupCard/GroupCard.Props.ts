import * as React from 'react';
import { GroupCard } from './GroupCard';
import { ISiteLogo } from '../SiteLogo/SiteLogo.Props';
import { IFacepileProps } from 'office-ui-fabric-react/lib/components/Facepile/index';
import { IMembersInfoProps } from '../MembersInfo/MembersInfo.Props';

export interface IGroupCardLinks {
    /** Text of the link to display*/
    title: string;

    /** Href of the link to open when it's clicked */
    href: string;

    /** Optional icon that will be displayed before the title text */
    icon?: string;

    /** Optional text id to be logged when this link is clicked on. e.g. SiteHeader.GroupCard.MailLink.clicked */
    engagementId?: string;
}

export interface IGroupCardProps extends React.Props<GroupCard> {
  /** Group Title  */
  title: string;

  /** List of links to be displayed for this group*/
  links: IGroupCardLinks[];

  /** SiteLogo properties */
  siteLogo: ISiteLogo;

  /** Group information text. E.g. whether this group is private is public */
  infoText?: string;

  /** Properties to pass through for MembersInfo */
  membersInfoProps?: IMembersInfoProps;

  /**
   * If defined, Facepile information will be rendered as well.
   * @default: null
   */
  facepile?: IFacepileProps;

  // Behaviors
  /** Event handler for when a link is clicked */
  onLinkClick?: (link: string, evt?: React.MouseEvent) => void;

}
