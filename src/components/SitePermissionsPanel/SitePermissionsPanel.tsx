import * as React from 'react';
import { ISitePermissionsPanelProps } from './SitePermissionsPanel.Props';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { SitePermissions } from '../SitePermissions/SitePermissions';
import { ISitePermissionsProps } from '../SitePermissions/SitePermissions.Props';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { ContextualMenu, DirectionalHint} from 'office-ui-fabric-react/lib/ContextualMenu';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';
import './SitePermissionsPanel.scss';

export class SitePermissionsPanel extends React.Component<ISitePermissionsPanelProps, any> {
    private menu: HTMLElement;
    private _resolveMenu: (el: HTMLElement) => any;
  constructor(props: ISitePermissionsPanelProps) {
    super(props);

            this._resolveMenu = (el) => this.menu = el;

    this.state = {
      showPanel: true,
      isInvitePeopleContextualMenuVisible: false,
      showShareSiteOnly: this.props.showShareSiteOnly
    };
  }

  public render(): React.ReactElement<ISitePermissionsPanelProps> {
    const { showShareSiteOnly } = this.props;

    return (
      <Panel
        isOpen={ this.state.showPanel }
        type={ PanelType.smallFixedFar }
        onDismiss= { this._closePanel }
        headerText={ this.props.title }
        >
        <p>{ this.props.panelDescription }</p>
        <div className='ms-sitePerm-ContextMenu'>
          <div className='ms-sitePermPanel-buttonArea' ref={ this._resolveMenu } >
            <Button className='ms-sitePermPanel-itemBtn' buttonType={ ButtonType.primary } onClick={ this._onClick }>
              { this.props.invitePeople }
            </Button>
          </div>
          { this.state.isInvitePeopleContextualMenuVisible && (
            <ContextualMenu
              items={this.props.menuItems}
              isBeakVisible={ false }
              targetElement={ this.menu }
              directionalHint={ DirectionalHint.bottomLeftEdge }
              onDismiss={ this._onDismiss }
              gapSpace={ 0 }
              />
          ) }
        </div>
        { !showShareSiteOnly && (
          <div>
            {
              (this.props !== undefined && this.props.sitePermissions !== undefined) ?
                this.props.sitePermissions.map((sitePermissions: ISitePermissionsProps, index: number) => {
                  return this._getSitePermissions(sitePermissions, index);
                }) : undefined
            }
          </div>) }
        { showShareSiteOnly && (
          <div> {'ppl picker goes here'}
          </div>) }
      </Panel>
    );
  }

  private _getSitePermissions(sitePermissions: ISitePermissionsProps, index: number): JSX.Element {
    return <SitePermissions {...sitePermissions} />;
  }

  @autobind
  private _closePanel() {
    this.setState({ showPanel: false });

    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }

  @autobind
  private _onClick() {
    this.setState({
      isInvitePeopleContextualMenuVisible: !this.state.isInvitePeopleContextualMenuVisible
    });
  }

  @autobind
  private _onDismiss(ev) {
    this.setState({
      isInvitePeopleContextualMenuVisible: false
    });
    ev.stopPropagation();
    ev.preventDefault();
  }
}
