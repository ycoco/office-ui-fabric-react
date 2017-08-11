import * as React from 'react';
import './GroupMembershipPanel.scss';
import { IGroupMembershipPanelProps } from './GroupMembershipPanel.Props';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { IGroupMemberPersona } from './GroupMembershipPanel.Props';
import { Persona, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { GroupMembershipMenu } from './GroupMembershipMenu/GroupMembershipMenu';
import { GroupMembershipList } from './GroupMembershipList/GroupMembershipList';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { PeoplePicker } from '../PeoplePicker/PeoplePicker';
import { PeoplePickerType } from '../PeoplePicker/PeoplePicker.Props';
import { IPeoplePickerQueryParams, IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';

export class GroupMembershipPanel extends React.Component<IGroupMembershipPanelProps, any> {
  constructor(props: IGroupMembershipPanelProps) {
    super(props);

    this.state = {
      showPanel: true,
      isAddingMembers: false, // If true, hide the members list and show the add group members UX
      isAddingGuest: false, // If true, show info message bar about Guests
      selectedMembers: [],
      showSavingSpinner: false,
      saveButtonDisabled: true // Disable Save button until at least one member is selected
    };

    Engagement.logData({ name: 'GroupMembershipPanel.Opened.Click' });
  }

  public render(): React.ReactElement<IGroupMembershipPanelProps> {
    // If members have loaded, display them. Otherwise, show a spinner.
    let membersList: JSX.Element = <Spinner className='ms-groupMemberList-spinner' />;

    // For long lists of members, render link to OWA.
    // If virtualized members list is disabled, message appears at bottom of members list and tells users
    // to go to OWA for the full members list.
    // If virtualized members list is enabled, message appears at top of members list and tells users to
    // go to OWA if they want to search the large list for a specific member.
    let searchMembersMessage: JSX.Element = undefined;
    let largeGroupMessage: JSX.Element = undefined;
    if (this.props.largeGroupMessage) {
      largeGroupMessage = (
        this._getMessageWithLink(this.props.largeGroupMessage, this.props.outlookLinkText, 'ms-groupMember-largeGroupMessage', this._logLargeGroupOutlookClick)
      );
    }

    const personas: IGroupMemberPersona[] = this.props ? this.props.personas : undefined;
    if (personas && personas.length > 0) {
      if (this.props.useVirtualizedMembersList) {
        // If flight is on, use virtualized members list (uses paging)
        searchMembersMessage = largeGroupMessage;
        membersList = (
          <GroupMembershipList
            members={ personas }
            totalNumberOfMembers={ this.props.totalNumberOfMembers }
            onRenderPersona={ this._onRenderPersona }
            onLoadMoreMembers={ this.props.onLoadMoreMembers }
          />
        );
      } else {
        // Otherwise, use old members list
        let members: JSX.Element = (
          <ul className='ms-groupMember-list'>
            { personas.map((persona: IGroupMemberPersona, index: number) => {
              const personaControl: JSX.Element = this._getPersonaControl(persona);
              return this._getPersonaListItem(personaControl, persona, index);
            }) }
          </ul>);
        membersList = (
          <div>
            { members }
            { largeGroupMessage }
          </div>
        );
      }
    }

    return (
      <Panel
        className='ms-groupMemberPanel'
        isOpen={ this.state.showPanel }
        type={ PanelType.smallFixedFar }
        onDismiss={ this._closePanel }
        isLightDismiss={ true }
        closeButtonAriaLabel={ this.props.closeButtonAriaLabel }
        headerText={ this.state.isAddingMembers ? this.props.addMembersText : this.props.title }
      >
        <div data-automationid='GroupMembershipPanelContents'>
          <Dialog
            isOpen={ this.props.showConfirmationDialog }
            type={ DialogType.close }
            onDismiss={ this._closeDialog }
            subText={ this.props.confirmationText }
            isBlocking={ false }
            closeButtonAriaLabel={ this.props.closeButtonAriaLabel }
          >
            <DialogFooter>
              <PrimaryButton onClick={ this._approveDialog }>{ this.props.okButtonText }</PrimaryButton>
              <DefaultButton onClick={ this._closeDialog }>{ this.props.cancelButtonText }</DefaultButton>
            </DialogFooter>
          </Dialog>
          { this.props.errorMessageText && (
            <div className='ms-groupMember-errorMessage'>
              <MessageBar
                messageBarType={ MessageBarType.error }
                isMultiline={ true }
                onDismiss={ this._dismissErrorMessage }
                dismissButtonAriaLabel={ this.props.dismissErrorMessageAriaLabel }>
                { this.props.errorMessageText }
              </MessageBar>
            </div>
          ) }
          { !this.state.isAddingMembers && (
            <div data-automationid='GroupMembersList'>
              { searchMembersMessage }
              { this.props.numberOfMembersText && (
                <div aria-live='assertive' className='ms-groupMember-membersCount' data-automationid='PanelNumberOfMembersText'>{ this.props.numberOfMembersText }</div>
              ) }
              { this.props.canAddMembers && (
                <PrimaryButton
                  onClick={ this._onClick }
                  iconProps={ { iconName: 'PeopleAdd' } }
                  data-automationid='AddMembersButton'>
                  { this.props.addMembersText }
                </PrimaryButton>) }
              { membersList }
            </div>
          ) }
          { this.state.isAddingMembers && (
            <div data-automationid='AddMembersView'>
              { this.state.isAddingGuest && (
                <div className='ms-groupMember-addingGuest'>
                  <MessageBar
                    messageBarType={ MessageBarType.info }
                    isMultiline={ true }>
                    { this.props.addingGuestText }
                  </MessageBar>
                </div>
              ) }
              { this._getAddMemberInstructions() }
              <div className='ms-groupMember-peoplePicker' data-automationid='AddMembersPeoplePicker'>
                <PeoplePicker
                  context={ this.props.pageContext }
                  peoplePickerType={ PeoplePickerType.listBelow }
                  peoplePickerQueryParams={ this._getPeoplePickerQueryParams() }
                  onSelectedPersonasChange={ this._onSelectedMembersChange }
                  inputProps={ this._getPeoplePickerInputProps() }
                />
              </div>
              <span className='ms-groupMemberButton-container'>
                <PrimaryButton
                  disabled={ this.state.saveButtonDisabled }
                  onClick={ this._onDoneClick }
                  data-automationid='AddMembersSaveButton'>
                  { this.props.doneButtonText }
                </PrimaryButton>
              </span>
              <span className='ms-groupMemberButton-container'>
                <DefaultButton onClick={ this._onCancelClick } data-automationid='AddMembersCancelButton'>
                  { this.props.cancelButtonText }
                </DefaultButton>
              </span>
              { this.state.showSavingSpinner && <Spinner className='ms-groupMember-spinner' /> }
            </div>
          ) }
        </div>
      </Panel>
    );
  }

  @autobind
  private _onRenderPersona(persona: IGroupMemberPersona, index: number) {
    if (persona && typeof index === 'number') {
      const personaControl: JSX.Element = this._getPersonaControl(persona);
      return <div
        className='ms-groupMember-itemBtn'
        title={ persona.name }
        key={ index }>
        <div className='ms-groupMember-personName'>{ personaControl }</div>
      </div>;
    } else {
      return undefined;
    }
  }

  private _getPersonaControl(persona: IGroupMemberPersona): JSX.Element {
    return (
      <Persona
        name={ persona.name }
        imageUrl={ persona.imageUrl }
        primaryText={ persona.name }
        size={ PersonaSize.small }
        hidePersonaDetails={ false }
        data-automationid='GroupMemberPersona' >
        <GroupMembershipMenu
          menuItems={ this.props.canChangeMemberStatus ? persona.memberStatusMenuItems : null }
          title={ persona.contextualMenuTitle }
          showSpinner={ persona.showSpinner } />
      </Persona>
    );
  }

  private _getPersonaListItem(personaControl: JSX.Element, persona: IGroupMemberPersona, index: number): JSX.Element {
    // When using the old custom list instead of the React list, we use li for accessibility
    return <li
      className='ms-groupMember-itemBtn'
      title={ persona.name }
      key={ index }>
      <div className='ms-groupMember-personName'>{ personaControl }</div>
    </li>;
  }

  /**
   * Get the instructions to show above the PeoplePicker.
   * If adding guests is allowed, use a formatted string with a link to the members list in Outlook. This directs users to Outlook if they wish to
   * add guests by resolving arbitrary email addresses, which is not supported as of June 2017.
   * If adding guests is not allowed, use a simple string.
   */
  private _getAddMemberInstructions(): JSX.Element {
    let instructionsClassName: string = 'ms-groupMember-addMemberInstructions';
    if (this.props.showGuestsMessage && this.props.addMembersOrGuestsInstructionsText && this.props.addGuestsLinkText) {
      return this._getMessageWithLink(this.props.addMembersOrGuestsInstructionsText, this.props.addGuestsLinkText, instructionsClassName, this._logAddGuestsLinkClick);
    } else {
      return (
        <div className={ instructionsClassName }>
          { this.props.addMembersInstructionsText }
        </div>
      );
    }
  }

  /**
   * Get a formatted message including a link to Outlook.
   * 
   * @param {string} outerMessage The message with the '{0}' token to indicate the position of the inline link
   * @param {string} innerMessage The text to display for the inline link
   * @param {string} divClassName The class name to apply to the outer div element
   * @param onClickFunction The function to call when a user clicks the link before navigating to Outlook. Used for engagement logging.
   */
  private _getMessageWithLink(outerMessage: string, innerMessage: string, divClassName: string, onClickFunction: () => {}): JSX.Element {
    let messageWithLink: JSX.Element = null;
    if (this.props.membersUrl &&
      outerMessage &&
      outerMessage.indexOf('{0}') !== -1 &&
      innerMessage) {
      // outerMessage uses the '{0}' token to indicate the position of the inline link.
      const outerMessageSplit = outerMessage.split('{0}');

      if (outerMessageSplit.length === 2) {
        messageWithLink = (
          <div className={ divClassName }>
            <span>
              { outerMessageSplit[0] }
            </span>
            <Link href={ this.props.membersUrl } onClick={ onClickFunction } target={ '_blank' }>
              { innerMessage }
            </Link>
            <span>
              { outerMessageSplit[1] }
            </span>
          </div>
        );
      }
    }
    return messageWithLink;
  }

  /**
   * Need to use non-default query parameters for the PeoplePicker.
   * In particular, do not allow email addresses or groups (security groups and SharePoint groups)
   */
  private _getPeoplePickerQueryParams(): IPeoplePickerQueryParams {
    return {
      allowEmailAddresses: false, // Cannot resolve email addresses
      allowMultipleEntities: null,
      allUrlZones: null,
      enabledClaimProviders: null,
      forceClaims: null,
      groupID: 0, // No group membership restrictions for the returned values
      maximumEntitySuggestions: 30,
      principalSource: 15, // Corresponds to all sources server side
      principalType: 1, // Corresponds to PrincipalType.user. Only users allowed, not security groups or SharePoint groups
      required: null,
      urlZone: null,
      urlZoneSpecified: null,
      filterExternalUsers: !this.props.canAddGuests, // Filter out external users
      blockExternalUsers: !this.props.canAddGuests // Cannot add external users
    } as IPeoplePickerQueryParams;
  }

  /**
   * Input element native props to be put onto the input element in the PeoplePicker
   */
  private _getPeoplePickerInputProps(): React.HTMLProps<HTMLInputElement> {
    return {
      placeholder: this.props.peoplePickerPlaceholderText
    } as React.HTMLProps<HTMLInputElement>;
  }

  @autobind
  private _closePanel() {
    this.setState({ showPanel: false });

    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }

  @autobind
  private _onClick(): void {
    Engagement.logData({ name: 'GroupMembershipPanel.AddMembers.Click' });
    this._setIsAddingMembers(true);
  }

  @autobind
  private _onCancelClick(): void {
    Engagement.logData({ name: 'GroupMembershipPanel.Cancel.Click' });
    this._setIsAddingMembers(false);
  }

  @autobind
  private _onDoneClick() {
    Engagement.logData({ name: 'GroupMembershipPanel.Save.Click' });

    // clear any error message from previous attempts
    if (this.props.errorMessageText) {
      this.props.clearErrorMessage();
    }

    if ((this.state.selectedMembers && this.state.selectedMembers.length > 0)) {
      if (this.props.onSave) {
        this.setState({
          showSavingSpinner: true,
          saveButtonDisabled: true
        });
        this.props.onSave(this.state.selectedMembers).then(() => {
          // If save was successful, return to members list view
          this.setState({
            isAddingMembers: false,
            isAddingGuest: false,
            selectedMembers: [], // Must manually reset selected members before navigating away
            showSavingSpinner: false,
            saveButtonDisabled: true
          });
        }, (error: any) => {
          // If save was not successful, remain in add members view
          // Error message was set in state manager
          this.setState({
            showSavingSpinner: false,
            saveButtonDisabled: false
          });
        });
      }
    } else {
      // If no members were selected to add, clicking Save simply takes you back to the members list experience
      this._setIsAddingMembers(false);
    }
  }

  /**
   * When a user clicks the link to view a large group in Outlook, log the event before
   * navigating away.
   */
  @autobind
  private _logLargeGroupOutlookClick(): boolean {
    // We want to log this differently depending on whether the virtual members list is enabled.
    // If the feature is enabled, users only need to go to OWA to search for a specific member.
    // If the feature is disabled, users must go to OWA to see all members of a large group.
    if (this.props.useVirtualizedMembersList) {
      Engagement.logData({ name: 'GroupMembershipPanel.LargeGroupSearchLink.Click' });
    } else {
      Engagement.logData({ name: 'GroupMembershipPanel.LargeGroupOutlookLink.Click' });
    }
    return true;
  }

  /**
   * When a user clicks the link to add guests in Outlook, log the event before
   * navigating away.
   */
  @autobind
  private _logAddGuestsLinkClick(): boolean {
    Engagement.logData({ name: 'GroupMembershipPanel.AddGuestOutlookLink.Click' });
    return true;
  }

  @autobind
  private _onSelectedMembersChange(selectedPersonas: IPerson[]): void {
    // If canAddGuests is true, we allow guest users to resolve in the PeoplePicker.
    // If one of the selected members is a guest, we need to show the guest info message.
    let guestIsSelected: boolean = false;
    if (this.props.canAddGuests) {
      guestIsSelected = selectedPersonas.some((value: IPerson) => { return value.entityType === 1 /* EntityType.externalUser */ })
    }
    this.setState({
      selectedMembers: selectedPersonas,
      isAddingGuest: guestIsSelected,
      saveButtonDisabled: !selectedPersonas.length // Disable Save button if zero members selected
    });
  }

  /**
   * When you switch between viewing the members list and adding members,
   * also clear any error messages, warnings, and previously selected members.
   *
   * @param {boolean} newState - true to choose the adding members state, false for the members list
   */
  private _setIsAddingMembers(newState: boolean): void {
    this.setState({
      isAddingMembers: newState,
      isAddingGuest: false,
      selectedMembers: [],
      saveButtonDisabled: true
    });
    if (this.props.errorMessageText) {
      this.props.clearErrorMessage();
    }
  }

  @autobind
  private _closeDialog() {
    if (this.props.onCloseConfirmationDialog) {
      this.props.onCloseConfirmationDialog();
    }
  }

  @autobind
  private _approveDialog() {
    if (this.props.onApproveConfirmationDialog) {
      this.props.onApproveConfirmationDialog();
    }
  }

  @autobind
  private _dismissErrorMessage() {
    this.props.clearErrorMessage();
  }
}
