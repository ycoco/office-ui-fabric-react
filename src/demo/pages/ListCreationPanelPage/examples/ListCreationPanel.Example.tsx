import * as React from 'react';
import { ListCreationPanel, IListCreationPanelProps, IListCreationPanelContentProps } from '../../../../components/index';
import { PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Button } from 'office-ui-fabric-react/lib/Button';

export interface IListCreationPanelExampleState {
  showPanel: boolean;
}

export class ListCreationPanelExample extends React.Component<React.Props<ListCreationPanelExample>, IListCreationPanelExampleState> {
  constructor() {
    super();
    this.state = { showPanel: false };
  }

  public render() {
    let listCreationPanelContentProps: IListCreationPanelContentProps = {
      panelDescription: '',
      nameFieldLabel: 'Name',
      nameFieldPlaceHolder: '',
      descriptionFieldLabel: 'Description',
      descriptionFieldPlaceHolder: '',
      showInQuickLaunchString: 'Show in site navigation',
      spinnerString: 'Creating...',
      onCreate: {
        onCreateString: 'Create',
        onCreateAction: () => alert('You hit create')
      },
      onCancel: {
        onCancelString: 'Cancel',
        onCancelAction: this._closePanel.bind(this)
      }
    };

    let listCreationPanelProps: IListCreationPanelProps = {
       panelProps: {
        isOpen: this.state.showPanel,
        type: PanelType.smallFixedFar,
        headerText: 'Create a list',
        isLightDismiss: true
      },
      listCreationPanelContentProps
    };

    return (
      <div>
        <Button description='Opens the Sample List Creation Panel' onClick={ this._showPanel.bind(this) }>Open Panel</Button>
        <ListCreationPanel {...listCreationPanelProps} />
      </div>
    );
  }

  private _showPanel() {
    this.setState( { showPanel: true } );
  }

  private _closePanel() {
    this.setState( { showPanel: false } );
  }
}
