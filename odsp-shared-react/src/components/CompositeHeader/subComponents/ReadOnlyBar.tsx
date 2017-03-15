import * as React from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';

export interface IReadOnlyBarProps {
  siteReadOnlyString: string;
}

export const ReadOnlyBar: React.StatelessComponent<IReadOnlyBarProps> = (props: IReadOnlyBarProps) => {
  return (
    <MessageBar messageBarType={ MessageBarType.warning } >
      { props.siteReadOnlyString }
    </MessageBar>
  );
}