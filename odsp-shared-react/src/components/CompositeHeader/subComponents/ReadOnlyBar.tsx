import * as React from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { ISiteReadOnlyProps } from '../../CompositeHeader';
import { SiteReadOnlyState } from '@ms/odsp-datasources/lib/dataSources/site/SiteDataSource';

export interface IReadOnlyBarProps {
  siteReadOnlyProps: ISiteReadOnlyProps;
}

export const ReadOnlyBar: React.StatelessComponent<IReadOnlyBarProps> = (readOnlyBarProps: IReadOnlyBarProps) => {
  let props: ISiteReadOnlyProps = readOnlyBarProps.siteReadOnlyProps;

  // default to the generic read only string
  let readOnlyString: string = props.siteReadOnlyString;
  let readOnlyState: SiteReadOnlyState = props.siteReadOnlyState;

  if (readOnlyState !== undefined && readOnlyState !== null && readOnlyState !== SiteReadOnlyState.unknown) {
    // the siteIsMovingString and siteMoveCompletedString are optional and may not be set
    if (readOnlyState === SiteReadOnlyState.siteMoveInProgress && props.siteIsMovingString) {
      readOnlyString = props.siteIsMovingString;
    } else if (readOnlyState === SiteReadOnlyState.siteMoveComplete && props.siteMoveCompletedString) {
      readOnlyString = props.siteMoveCompletedString;
    }
  }

  return (
    <MessageBar messageBarType={ MessageBarType.warning } >
      { readOnlyString }
    </MessageBar>
  );
}