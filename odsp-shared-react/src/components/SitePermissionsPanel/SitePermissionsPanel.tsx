import * as React from 'react';
import { ISitePermissionsPanelProps } from './SitePermissionsPanel.Props';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { SitePermissions } from '../SitePermissions/SitePermissions';
import { ISitePermissionsProps, ISitePermissionsContextualMenuItem, IPermissionPerson } from '../SitePermissions/SitePermissions.Props';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { ContextualMenu, DirectionalHint, IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
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
import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import { PeoplePickerItemWithMenu, IPersonWithMenuProps } from '../PeoplePicker/PeoplePickerItemWithMenu';
import Features from '@ms/odsp-utilities/lib/features/Features';
import PrincipalType from '@ms/odsp-datasources/lib/dataSources/roleAssignments/PrincipalType';
import { Killswitch } from '@ms/odsp-utilities/lib/killswitch/Killswitch';


export class SitePermissionsPanel extends React.Component<ISitePermissionsPanelProps, any> {
  private menu: HTMLElement;
  private _currentPicker: PeoplePickerType;
  private _resolveMenu: (el: HTMLElement) => any;
  private _isUseNewSitePermissionsMinorEnabled: boolean;
  private _peoplePicker: PeoplePicker;

  constructor(props: ISitePermissionsPanelProps) {
    super(props);

    this._resolveMenu = (el) => this.menu = el;

    this.state = {
      showPanel: true,
      isInvitePeopleContextualMenuVisible: false,
      showShareSiteOnly: this.props.showShareSiteOnly,
      showSavingSpinner: false,
      saveButtonDisabled: false
    };

    this._currentPicker = PeoplePickerType.listBelow;
    this._isUseNewSitePermissionsMinorEnabled = Features.isFeatureEnabled(
      { ODB: 798, ODC: null, Fallback: false }
    );
    Engagement.logData({ name: 'SitePermissionsPanel.Opened' });
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
            <FocusZone>
              <span>
                { helpTextSplit[0] }
              </span>
              <Link href={ this.props.membersUrl } target={ '_blank' } className='ms-MessageBar-link'>
                { this.props.goToOutlookLink }
              </Link>
              <span>
                { helpTextSplit[1] }
              </span>
            </FocusZone>
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

    let peoplePickerSelectedItemRender;
    if (!Killswitch.isActivated('06357ED9-875B-4BED-A1AD-F7AA1A8E5B94')) {
      peoplePickerSelectedItemRender = (props: IPickerItemProps<IPerson>) => this.renderPeoplePickerItemWithMenu(props);
    }
    // TODO: remove the closeButton check when the Close string is available in odsp-next
    return (
      <Panel
        className='ms-SitePermPanel'
        isOpen={ this.state.showPanel }
        type={ PanelType.smallFixedFar }
        onDismiss={ this._closePanel }
        isLightDismiss={ true }
        headerText={ this.props.title }
        >
        { !showShareSiteOnly && (
          <div>
            { this._isUseNewSitePermissionsMinorEnabled && (
              <div>
                <p className='ms-sitePermPanel-TextArea'>{ this.props.panelDescription }</p>
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
            { !this._isUseNewSitePermissionsMinorEnabled && (
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
            { this._isUseNewSitePermissionsMinorEnabled && this.props.advancedPermSettingsUrl && (
              <div className='ms-SitePermPanel-AdvancedPerm'>
                < Link href={ this.props.advancedPermSettingsUrl } target={ '_blank' } className='ms-MessageBar-link'>
                  { this.props.advancedPermSettings }
                </Link>
              </div>
            ) }
          </div>) }
        { showShareSiteOnly && (
          <div>
            <div className='ms-SitePermPanel-PeoplePicker'>
              <div className='ms-SitePermPanel-PeoplePicker'>
                { this.props.addUserOrGroupText }
              </div>
              <div className='ms-SitePermPanel-PeoplePicker'>
                { this.props.shareSiteOnlyVerboseText }
              </div>
              <PeoplePicker
                noResultsFoundText={ ' ' }
                context={ this.props.pageContext }
                peoplePickerType={ this._currentPicker }
                ref={ (c) => { if (c) { this._peoplePicker = c; } } }
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

  private renderPeoplePickerItemWithMenu(props: IPickerItemProps<IPermissionPerson>): JSX.Element {
    let TypedMenu = PeoplePickerItemWithMenu as new (props: IPickerItemProps<IPermissionPerson>) => PeoplePickerItemWithMenu<IPermissionPerson>;
    let availablePermissions = this.props.sitePermissionsContextualMenuItems.map(value => value.permissionLevel);
    let currentPermissionLevel: PermissionLevel;

    if (props.item.permissionLevel) {
      currentPermissionLevel = props.item.permissionLevel;
    } else {
      if (!currentPermissionLevel) {
        if (availablePermissions.indexOf(PermissionLevel.Edit) > -1) {
          currentPermissionLevel = PermissionLevel.Edit;
        } else if (availablePermissions.indexOf(PermissionLevel.Read) > -1) {
          currentPermissionLevel = PermissionLevel.Read;
        } else {
          currentPermissionLevel = PermissionLevel.FullControl;
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
        });
      }
    }

    Engagement.logData({ name: 'SitePermissionsPanel.PeoplePicker.Save' });
  }

  @autobind
  private _onCancelClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {

    if (this.props.onCancel) {
      this.props.onCancel();
    }
    Engagement.logData({ name: 'SitePermissionsPanel.PeoplePicker.Cancel' });
  }

}
