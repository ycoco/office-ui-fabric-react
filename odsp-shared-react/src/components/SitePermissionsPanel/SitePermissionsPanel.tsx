import * as React from 'react';
import { ISitePermissionsPanelProps } from './SitePermissionsPanel.Props';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { SitePermissions } from '../SitePermissions/SitePermissions';
import { ISitePermissionsProps } from '../SitePermissions/SitePermissions.Props';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { ContextualMenu, DirectionalHint } from 'office-ui-fabric-react/lib/ContextualMenu';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';
import './SitePermissionsPanel.scss';
import { PeoplePicker } from '../PeoplePicker/PeoplePicker';
import { PeoplePickerType } from '../PeoplePicker/PeoplePicker.Props';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import { Link } from 'office-ui-fabric-react/lib/Link';

export class SitePermissionsPanel extends React.Component<ISitePermissionsPanelProps, any> {
  private menu: HTMLElement;
  private _currentPicker: PeoplePickerType;
  private _resolveMenu: (el: HTMLElement) => any;

  constructor(props: ISitePermissionsPanelProps) {
    super(props);

    this._resolveMenu = (el) => this.menu = el;

    this.state = {
      showPanel: true,
      isInvitePeopleContextualMenuVisible: false,
      showShareSiteOnly: this.props.showShareSiteOnly,
      showSavingSpinner: false,
      saveButtonDisabled: false,
      pplPickerSelectedItems: []
    };

    this._currentPicker = PeoplePickerType.listBelow;
  }

  public render(): React.ReactElement<ISitePermissionsPanelProps> {
    const { showShareSiteOnly } = this.props;

    let helpTextFooter = null;
    if (this.props.goToOutlookText &&
      this.props.goToOutlookText.indexOf('{0}') !== -1 &&
      this.props.goToOutlookLink) {
      // goToOutlookText designates the position of the inline link with a '{0}' token to permit proper localization.
      // Split the string up and render the anchor and span elements separately.
      const helpTextSplit = this.props.goToOutlookText.split('{0}');

      if (helpTextSplit.length === 2) {
        helpTextFooter = (
          <p>
            <span>
              { helpTextSplit[0]}
            </span>
            <Link href={ this.props.membersUrl } target={ '_blank' } className='ms-MessageBar-link'>
              { this.props.goToOutlookLink }
            </Link>
            <span>
              { helpTextSplit[1]}
            </span>
          </p>
        );
      }
    } else {
      // TODO: remove this option once the new string are available in odsp-next
      helpTextFooter = (
        <p>
          { this.props.goToOutlookText }
          < Link href={ this.props.membersUrl } target={ '_blank' } className='ms-MessageBar-link'>
            { this.props.goToOutlookLink }
          </Link>
        </p>
      );
    }

    // TODO: Replace true/false with flight number
    return (
      <Panel
        isOpen={ this.state.showPanel }
        type={ PanelType.smallFixedFar }
        onDismiss={ this._closePanel }
        headerText={ this.props.title }
        >
        { !showShareSiteOnly && (
          <div>
            { false && (
              <div>
                <p>{ this.props.panelDescription }</p>
                <div className='ms-sitePerm-ContextMenu'>
                  <div className='ms-sitePermPanel-buttonArea' ref={ this._resolveMenu } >
                    <Button className='ms-sitePermPanel-itemBtn' buttonType={ ButtonType.primary } onClick={ this._onClick }>
                      { this.props.invitePeople }
                    </Button>
                  </div>
                  { this.state.isInvitePeopleContextualMenuVisible && (
                    <ContextualMenu
                      items={ this.props.menuItems }
                      isBeakVisible={ false }
                      targetElement={ this.menu }
                      directionalHint={ DirectionalHint.bottomLeftEdge }
                      onDismiss={ this._onDismiss }
                      gapSpace={ 0 }
                      />
                  ) }
                </div>
              </div>
            ) }
            { true && (
              <div>
                { helpTextFooter }
              </div>
            ) }
            <div>
              {
                (this.props !== undefined && this.props.sitePermissions !== undefined) ?
                  this.props.sitePermissions.map((sitePermissions: ISitePermissionsProps, index: number) => {
                    return this._getSitePermissions(sitePermissions, index);
                  }) : undefined
              }
            </div>
            { false && this.props.advancedPermSettingsUrl && (
              < Link href={ this.props.advancedPermSettingsUrl } className='ms-MessageBar-link'>
                { this.props.advancedPermSettings }
              </Link>
            ) }
          </div>) }
        { showShareSiteOnly && (
          <div>
            <div className='ms-SitePermPanel-PeoplePicker'>
              <div className='ms-SitePermPanel-PeoplePicker'>
                { this.props.addUserOrGroupText }
              </div>
              <PeoplePicker
                context={ this.props.pageContext }
                peoplePickerType={ this._currentPicker }
                onSelectedPersonasChange={ this._onSelectedPersonasChange } />
            </div>
            <div>
              <Button
                buttonType={ ButtonType.primary }
                disabled={ this.state.saveButtonDisabled }
                onClick={ this._onSaveClick }>
                { this.props.saveButton }
              </Button>
              <Button onClick={ this._onCancelClick }>
                { this.props.cancelButton }
              </Button>
            </div>
            { this.state.showSavingSpinner && <Spinner /> }
          </div>
        ) }
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

  @autobind
  private _onSaveClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    this.setState({
      showSavingSpinner: true,
      saveButtonDisabled: true
    });

    if (this.state.pplPickerSelectedItems && this.state.pplPickerSelectedItems.length > 0) {
      let users: string[] = this.state.pplPickerSelectedItems.map(iPerson => { return iPerson.userId; });
      if (this.props.onSave) {
        this.props.onSave(users).done((success: boolean) => {
          this.setState({
            showSavingSpinner: false,
            saveButtonDisabled: false
          });
        });
      }
    }
  }

  @autobind
  private _onCancelClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {

    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }

  @autobind
  private _onSelectedPersonasChange(pplPickerItems: IPerson[]) {
    this.setState({ pplPickerSelectedItems: pplPickerItems });
  }
}
