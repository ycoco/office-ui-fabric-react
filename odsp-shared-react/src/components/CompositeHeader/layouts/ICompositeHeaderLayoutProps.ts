import { IWithResponsiveModeState } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { ISiteHeaderProps } from '../../SiteHeader/index';

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
  /** Follow link component. */
  followButton?: JSX.Element;
  /** Share link component. */
  shareButton?: JSX.Element;
  /** Go to outlook link. */
  goToOutlookButton?: JSX.Element;
  /** Share dialog. */
  shareDialog?: JSX.Element;
  /** Searchbox component. */
  searchBox?: React.ReactElement<{}>;
}