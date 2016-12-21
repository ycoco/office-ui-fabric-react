import * as React from 'react';
import { ListCreationPanelContent, IListCreationPanelProps } from './index';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import './ListCreationPanel.scss';

export class ListCreationPanel extends React.Component<IListCreationPanelProps, any> {
  public static defaultProps = {
    panelProps: {
      type: PanelType.smallFixedFar
    }
  };

  constructor(props: IListCreationPanelProps) {
    super(props);
  }

  public render() {
    return (
      <Panel
        className='ms-ListCreationPanel'
        { ...this.props.panelProps }
        firstFocusableSelector='ms-TextField-field'
        >
        <ListCreationPanelContent { ...this.props.listCreationPanelContentProps } />
      </Panel>);
  }
}
