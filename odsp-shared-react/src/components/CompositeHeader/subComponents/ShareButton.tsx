import * as React from 'react';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { CommandButton } from 'office-ui-fabric-react/lib/Button';
import { IShareButtonProps } from '../CompositeHeader.Props';

export const ShareButton: React.StatelessComponent<IShareButtonProps> = (props: IShareButtonProps) => {
  return (
    <CommandButton
      icon='Share'
      className='ms-CompositeHeader-collapsible'
      onClick={ props.onShare }
      text={ props.responsiveMode >= ResponsiveMode.small && props.shareLabel }>
    </CommandButton>
  );
}
