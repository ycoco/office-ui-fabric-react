import * as React from 'react';
import { ListCreationPanel, IListCreationPanelProps, IListCreationPanelContentProps } from '../../../../components/index';
import { PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Button } from 'office-ui-fabric-react/lib/Button';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';

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
        onCancelAction: this._closePanel
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
        <Button description='Opens the Sample List Creation Panel' onClick={ this._showPanel }>Open Panel</Button>
        <ListCreationPanel {...listCreationPanelProps} />
      </div>
    );
  }

  @autobind
  private _showPanel() {
    this.setState( { showPanel: true } );
  }

  @autobind
  private _closePanel() {
    this.setState( { showPanel: false } );
  }
}
