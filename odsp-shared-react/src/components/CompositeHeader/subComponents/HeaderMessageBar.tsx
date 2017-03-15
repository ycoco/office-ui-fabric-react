import * as React from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IExtendedMessageBarProps } from '../CompositeHeader.Props';

export interface IHeaderMessageBarProps {
  messageBarProps: IExtendedMessageBarProps;
}

export const HeaderMessageBar: React.StatelessComponent<IHeaderMessageBarProps> = (props: IHeaderMessageBarProps) => {
  let link: JSX.Element = _renderMessageBarLink(props.messageBarProps);

  function _renderMessageBarLink(messageBarProps: IExtendedMessageBarProps): JSX.Element {
    let target: string = messageBarProps.linkTarget;
    let text: string = messageBarProps.linkText || messageBarProps.linkTarget;

    if (text && target) {
      return (
        <Link href={ target } className='ms-MessageBar-link'>{ text }</Link>
      );
    } else {
      return undefined;
    }
  }

  return (
    <MessageBar messageBarType={ MessageBarType.warning }
      ariaLabel={ props.messageBarProps.ariaLabel } >
      { props.messageBarProps.message }
      { link }
    </MessageBar>
  );
}