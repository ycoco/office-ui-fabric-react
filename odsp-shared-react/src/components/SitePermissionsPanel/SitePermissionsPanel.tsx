import * as React from 'react';
import { ISitePermissionsPanelProps } from './SitePermissionsPanel.Props';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { SitePermissions } from '../SitePermissions/SitePermissions';
import { ISitePermissionsProps, ISitePermissionsContextualMenuItem, IPermissionPerson } from '../SitePermissions/SitePermissions.Props';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ContextualMenu, DirectionalHint } from 'office-ui-fabric-react/lib/ContextualMenu';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import './SitePermissionsPanel.scss';
import { PeoplePicker } from '../PeoplePicker/PeoplePicker';
import { PermissionLevel } from '../../containers/SitePermissions/SitePermissionsStateManager';
import {
  IPickerItemProps
} from 'office-ui-fabric-react/lib/Pickers';
import { PeoplePickerType } from '../PeoplePicker/PeoplePicker.Props';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import { PeoplePickerItemWithMenu } from '../PeoplePicker/PeoplePickerItemWithMenu';
import PrincipalType from '@ms/odsp-datasources/lib/dataSources/roleAssignments/PrincipalType';
import { Killswitch } from '@ms/odsp-utilities/lib/killswitch/Killswitch';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';

export class SitePermissionsPanel extends React.Component<ISitePermissionsPanelProps, any> {
  private menu: HTMLElement;
  private _currentPicker: PeoplePickerType;
  private _resolveMenu: (el: HTMLElement) => any;
  private _peoplePicker: PeoplePicker;
  private _mailMessage: string;

  constructor(props: ISitePermissionsPanelProps) {
    super(props);

    this._resolveMenu = (el) => this.menu = el;
    this._mailMessage = '';
    this.state = {
      showPanel: true,
      isInvitePeopleContextualMenuVisible: false,
      showShareSiteOnly: this.props.showShareSiteOnly,
      showSavingSpinner: false,
      saveButtonDisabled: false,
      shouldHidePermControl: false,
      shouldSendEmail: true,
      isPersonaSelected: false
    };

    this._currentPicker = PeoplePickerType.listBelow;
    Engagement.logData({ name: 'SitePermissionsPanel.Opened.Click' });
  }

  public render(): React.ReactElement<ISitePermissionsPanelProps> {
    const { showShareSiteOnly } = this.props;
    const {
      showPanel,
      isInvitePeopleContextualMenuVisible,
      showSavingSpinner,
      shouldHidePermControl,
      shouldSendEmail,
      isPersonaSelected }  = this.state;

    let helpTextFooterForAddMemLink: JSX.Element = null;
    const {shareSiteOnlyVerboseText, shareSiteOnlyAddMembersLinkText, goToOutlookOnClick } = this.props;
    if (shareSiteOnlyVerboseText &&
      shareSiteOnlyVerboseText.indexOf('{0}') !== -1 &&
      shareSiteOnlyAddMembersLinkText &&
      goToOutlookOnClick) {
      // shareSiteOnlyVerboseText designates the position of the inline link with a '{0}' token to permit proper localization.
      // Split the string up and render the anchor and span elements separately.
      const textSplit = shareSiteOnlyVerboseText.split('{0}');

      if (textSplit.length === 2) {
        helpTextFooterForAddMemLink = (
          <div className='ms-SitePermPanel-PeoplePicker' data-automationid='SitePermissionsPanelPeoplePicker'>
            <span>
              { textSplit[0] }
            </span>
            <Link className='ms-SitePermPanel-Link' onClick={ this.props.goToOutlookOnClick } data-automationid='SitePermissionsPanelAddMemberLink'>
              { shareSiteOnlyAddMembersLinkText }
            </Link>
            <span>
              { textSplit[1] }
            </span>
          </div>
        );
      }
    }

    let peoplePickerSelectedItemRender;
    if (!Killswitch.isActivated('06357ED9-875B-4BED-A1AD-F7AA1A8E5B94')) {
      peoplePickerSelectedItemRender = (props: IPickerItemProps<IPerson>) => this.renderPeoplePickerItemWithMenu(props);
    }
    // TODO: remove the closeButton check when the Close string is available in odsp-next
    return (
      <Panel
        className='ms-SitePermPanel'
        isOpen={ showPanel && !this.props.shouldDismissPanel }
        type={ PanelType.smallFixedFar }
        onDismiss={ this._closePanel }
        isLightDismiss={ true }
        headerText={ showShareSiteOnly ? this.props.shareSiteTitle : this.props.title }
        forceFocusInsideTrap={ false }
        >
        { !showShareSiteOnly && (
          <div>
            <div>
              <p className='ms-sitePermPanel-TextArea' data-automationid='SitePermissionsPanelDescription'>{ this.props.panelDescription }</p>
              <div className='ms-sitePerm-ContextMenu'>
                <div className='ms-sitePermPanel-buttonArea' ref={ this._resolveMenu } >
                  <PrimaryButton className='ms-sitePermPanel-itemBtn' onClick={ this._onClick } data-automationid='SitePermissionsPanelInviteButton'>
                    { this.props.invitePeople }
                  </PrimaryButton>
                </div>
                { isInvitePeopleContextualMenuVisible && (
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
            <div>
              {
                (this.props !== undefined && this.props.sitePermissions !== undefined) ?
                  this.props.sitePermissions.map((sitePermissions: ISitePermissionsProps, index: number) => {
                    return this._getSitePermissions(sitePermissions, index);
                  }) : undefined
              }
            </div>
            { this.props.advancedPermSettingsUrl && (
              <div className='ms-SitePermPanel-AdvancedPerm'>
                < Link href={ this.props.advancedPermSettingsUrl } target={ '_blank' } className='ms-MessageBar-link' data-automationid='SitePermissionsPanelAdvancedPermLink'>
                  { this.props.advancedPermSettings }
                </Link>
              </div>
            ) }
          </div>) }
        { showShareSiteOnly && (
          <div>
            <div onClick={ this._removePermControl } className='ms-SitePermPanel-PeoplePicker' data-automationid='SitePermissionsPanelPeoplePicker'>
              <div className='ms-SitePermPanel-PeoplePicker'>
                { this.props.addUserOrGroupText }
              </div>
              { helpTextFooterForAddMemLink }
              <PeoplePicker
                noResultsFoundText={ ' ' }
                context={ this.props.pageContext }
                peoplePickerType={ this._currentPicker }
                ref={ (c) => { if (c) { this._peoplePicker = c; } } }
                onSelectedPersonasChange = { this._handlePersonaChanged }
                onRenderItem={ peoplePickerSelectedItemRender }

                peoplePickerQueryParams={ {
                  allowEmailAddresses: false,
                  allowMultipleEntities: null,
                  allUrlZones: null,
                  enabledClaimProviders: null,
                  forceClaims: null,
                  groupID: 0,
                  maximumEntitySuggestions: 30,
                  // Corresponds to all sources server side.
                  principalSource: 15,
                  blockExternalUsers: true,
                  /* tslint:disable */
                  principalType: (PrincipalType.user | PrincipalType.securityGroup),
                  /* tslint:enable */
                  required: null,
                  urlZone: null,
                  urlZoneSpecified: null
                } }
                />
            </div>

            {this.props.shouldLoadSharePanelOnly &&
              <div>
                {!shouldHidePermControl &&
                  <div>
                  {
                    (this.props !== undefined && this.props.sitePermissions !== undefined) ?
                      this.props.sitePermissions.map((sitePermissions: ISitePermissionsProps, index: number) => {
                        return this._getSitePermissions(sitePermissions, index);
                      }) : undefined
                  }
                  </div>
                }
                { isPersonaSelected &&
                  <div>
                    <Checkbox
                      defaultChecked={ true }
                      label={ this.props.sendEmailText }
                      onChange={ this._onChangeSendEmail}
                    />
                    { shouldSendEmail &&
                      <div>
                        <TextField
                          multiline={ true }
                          resizable={ false }
                          placeholder={ this.props.messagePlaceHolderText }
                          onChanged={ (newValue) => this._mailMessage = newValue }
                        />
                        { this.props.sitePreviewLoader }
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <div>
              <span className='ms-SitePermPanelButton-container'>
                <PrimaryButton
                  disabled={ !isPersonaSelected }
                  onClick={ this._onSaveClick }
                  data-automationid='SitePermissionsPanelSaveButton'>
                  { this.props.saveButton }
                </PrimaryButton>
              </span>
              <span className='ms-SitePermPanelButton-container'>
                <DefaultButton
                  onClick={ this._onCancelClick }
                  data-automationid='SitePermissionsPanelCancelButton'>
                  { this.props.cancelButton }
                </DefaultButton>
              </span>
            </div>
            { showSavingSpinner && <Spinner /> }
          </div>
        ) }
      </Panel>
    );
  }

  @autobind
  private _onChangeSendEmail(ev: React.MouseEvent<any>): void {
    this.setState ({
      shouldSendEmail: !this.state.shouldSendEmail
    });
  }

  @autobind
  private _removePermControl(ev: React.MouseEvent<any>): void {
    this.setState ({
      shouldHidePermControl: true
    });
  }

  @autobind
  private _handlePersonaChanged(): void {
    if (this._peoplePicker.selectedPeople.length >= 0) {
      this.setState ({
        isPersonaSelected: true
      });
    }
  }

  private renderPeoplePickerItemWithMenu(props: IPickerItemProps<IPermissionPerson>): JSX.Element {
    let TypedMenu = PeoplePickerItemWithMenu as new (props: IPickerItemProps<IPermissionPerson>) => PeoplePickerItemWithMenu<IPermissionPerson>;
    let availablePermissions = this.props.sitePermissionsContextualMenuItems.map(value => value.permissionLevel);
    let currentPermissionLevel: PermissionLevel;

    if (props.item.permissionLevel) {
      currentPermissionLevel = props.item.permissionLevel;
    } else {
      if (!currentPermissionLevel) {
        if (this.props.addMemberDefaultPermissionLevel && availablePermissions.indexOf(this.props.addMemberDefaultPermissionLevel) > -1) {
          currentPermissionLevel = this.props.addMemberDefaultPermissionLevel;
        } else {
          if (availablePermissions.indexOf(PermissionLevel.Edit) > -1) {
            currentPermissionLevel = PermissionLevel.Edit;
          } else if (availablePermissions.indexOf(PermissionLevel.Read) > -1) {
            currentPermissionLevel = PermissionLevel.Read;
          } else {
            currentPermissionLevel = PermissionLevel.FullControl;
          }
        }
      }
    }

    let menuItems = this.props.sitePermissionsContextualMenuItems.filter(item => item.permissionLevel !== currentPermissionLevel);

    menuItems.forEach(element => {
      element.onClick = (ev?: React.MouseEvent<HTMLElement>, contextualMenuItem?: ISitePermissionsContextualMenuItem) => {
        let changedItem = props.item;
        changedItem.permissionLevel = contextualMenuItem.permissionLevel;
        props.onItemChange(changedItem, props.index);
      }
    });

    return <TypedMenu
      {...props}
      menuTitle={ this.props.permissionStrings[currentPermissionLevel] }
      menuItems={ menuItems }
      />
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
    Engagement.logData({ name: 'SitePermissionsPanel.InvitePeople.Click' });
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

    if (this._peoplePicker.selectedPeople && this._peoplePicker.selectedPeople.length > 0) {
      let users = this._peoplePicker.selectedPeople as IPermissionPerson[];
      if (this.props.onSave) {
        this.props.onSave(users).done((success: boolean) => {

          this.setState({
            showSavingSpinner: false,
            saveButtonDisabled: false
          });

          if (
            this.props.onSendEmail &&
            this.state.shouldSendEmail
          ) {
            this.props.onSendEmail(this._mailMessage, users);
            this.setState({
              showPanel: false
            })
          }

        });
      }
    }

    Engagement.logData({ name: 'SitePermissionsPanel.Save.Click' });
  }

  @autobind
  private _onCancelClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
    Engagement.logData({ name: 'SitePermissionsPanel.Cancel.Click' });
  }

}
