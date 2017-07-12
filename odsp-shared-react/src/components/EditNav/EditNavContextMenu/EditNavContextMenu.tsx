import * as React from 'react';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { ContextualMenu, DirectionalHint } from 'office-ui-fabric-react/lib/ContextualMenu';
import { getRTL } from 'office-ui-fabric-react/lib/Utilities';
import './EditNavContextMenu.scss';

export class EditNavContextMenu extends React.Component<any, any> {

  constructor() {
    super();
  }

  public render(): React.ReactElement<{}> {
    if (!this.props.menuItems) {
      return null;
    }
    let isRTL = getRTL();

    return (
      <FocusZone direction={ FocusZoneDirection.vertical }>
        <ContextualMenu
          targetElement={ this.props.targetElement }
          directionalHint={ isRTL ? DirectionalHint.bottomRightEdge : DirectionalHint.bottomLeftEdge }
          items={ this.props.menuItems }
          isBeakVisible={ false }
          gapSpace={ 0 }
          onDismiss={ this.props.onDismiss }
          className='ms-EditNav_contextMenu'
        />
      </FocusZone>
    );
  }
}
