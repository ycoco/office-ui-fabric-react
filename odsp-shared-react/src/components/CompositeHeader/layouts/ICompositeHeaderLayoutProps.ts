import { IWithResponsiveModeState } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { ISiteHeaderProps } from '../../SiteHeader/index';
import { IFollowProps, IShareButtonProps } from '../CompositeHeader.Props';

export interface ICompositeHeaderLayoutProps extends IWithResponsiveModeState {
  /** Site header properties. */
  siteHeaderProps: ISiteHeaderProps;
  /** Horizontal nav component. */
  horizontalNav: JSX.Element;
  /** ReadOnlyBar component. */
  readOnlyBar?: JSX.Element;
  /** MessageBar component. */
  messageBar?: JSX.Element;
  /** PolicyBar component. */
  policyBar?: JSX.Element;
  /** Follow link properties. */
  follow?: IFollowProps;
  /** Share link properties. */
  share?: IShareButtonProps;
  /** Go to outlook link. */
  goToOutlookButton?: JSX.Element;
  /** Share dialog. */
  shareDialog?: JSX.Element;
  /** Searchbox component. */
  searchBox?: React.ReactElement<{}>;
}