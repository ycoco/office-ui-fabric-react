import * as React from 'react';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { CommandButton } from 'office-ui-fabric-react/lib/Button';
import { IShareButtonProps } from '../CompositeHeader.Props';

export interface IShareButtonInternalProps extends IShareButtonProps {
  onClickCallback: (ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
}

export const ShareButton: React.StatelessComponent<IShareButtonInternalProps> = (props: IShareButtonInternalProps) => {
  return (
    <CommandButton
      icon='Share'
      className='ms-CompositeHeader-collapsible'
      onClick={ props.onClickCallback }
      text={ props.responsiveMode >= ResponsiveMode.small && props.shareLabel }>
    </CommandButton>
  );
}
