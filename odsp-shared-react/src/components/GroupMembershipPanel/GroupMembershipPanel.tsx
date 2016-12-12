import * as React from 'react';
import './GroupMembershipPanel.scss';
import { IGroupMembershipPanelProps } from './GroupMembershipPanel.Props';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { IGroupMemberPersona } from './GroupMembershipPanel.Props';
import { Persona, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';
import { GroupMembershipMenu } from '../GroupMembershipMenu/GroupMembershipMenu';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { PeoplePicker } from '../PeoplePicker/PeoplePicker';
import { PeoplePickerType } from '../PeoplePicker/PeoplePicker.Props';
import { IPeoplePickerQueryParams, IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';

export class GroupMembershipPanel extends React.Component<IGroupMembershipPanelProps, any> {
  constructor(props: IGroupMembershipPanelProps) {
    super(props);

    this.state = {
      showPanel: true,
      isAddingMembers: false, // If true, hide the members list and show the add group members UX
      selectedMembers: [],
      showSavingSpinner: false,
      saveButtonDisabled: false
    };

    Engagement.logData({ name: 'GroupMembershipPanel.Opened' });
  }

  public render(): React.ReactElement<IGroupMembershipPanelProps> {
    return (
      <Panel
        className='ms-groupMemberPanel'
        isOpen={ this.state.showPanel }
        type={ PanelType.smallFixedFar }
        onDismiss= { this._closePanel }
        headerText={ this.state.isAddingMembers ? this.props.addMembersText : this.props.title }
        >
          { this.props.errorMessageText && (
            <div className='ms-groupMember-errorMessage'>{ this.props.errorMessageText }</div>
          )}
          { !this.state.isAddingMembers && (
            <div>
              { this.props.numberOfMembersText && (
                <div className='ms-groupMember-membersCount'>{ this.props.numberOfMembersText }</div>
              )}
              <Button
                buttonType={ ButtonType.hero }
                onClick={ this._onClick }
                icon='PeopleAdd'>
                { this.props.addMembersText }
              </Button>
              <div>
                { (this.props && this.props.personas) ?
                    this.props.personas.map((persona: IGroupMemberPersona, index: number) => {
                        const personaControl: JSX.Element = this._getPersonaControl(persona);
                        return this._getPersona(personaControl, persona, index);
                    }) : undefined }
              </div>
              { this.props.largeGroupMessage && (
                <div>{ this._getLargeGroupMessage() }</div>
              )}
            </div>
          )}
          { this.state.isAddingMembers && (
            <div>
              <div className='ms-groupMember-addMemberInstructions'>
                { this.props.addMembersInstructionsText }
              </div>
              <div className='ms-groupMember-peoplePicker'>
                <PeoplePicker
                  context={ this.props.pageContext }
                  peoplePickerType={ PeoplePickerType.listBelow }
                  peoplePickerQueryParams={ this._getPeoplePickerQueryParams() }
                  onSelectedPersonasChange={ this._onSelectedMembersChange }
                  inputProps={ this._getPeoplePickerInputProps() }
                />
              </div>
              <Button
                buttonType={ ButtonType.primary }
                disabled={ this.state.saveButtonDisabled }
                onClick={ this._onDoneClick }>
                { this.props.doneButtonText }
              </Button>
              <Button onClick={ this._onCancelClick }>
                { this.props.cancelButtonText }
              </Button>
              { this.state.showSavingSpinner && <Spinner /> }
            </div>
          )}
      </Panel>
    );
  }

  private _getPersonaControl(persona: IGroupMemberPersona): JSX.Element {
      return (
          <Persona
              name={ persona.name }
              imageInitials={ persona.imageInitials }
              imageUrl={ persona.imageUrl }
              initialsColor={ persona.initialsColor }
              primaryText={ persona.name }
              size={ PersonaSize.extraSmall }
              hidePersonaDetails={ false } >
              <GroupMembershipMenu
                  menuItems={ this.props.canChangeMemberStatus ? persona.memberStatusMenuItems : null }
                  title={ persona.isGroupOwner ? this.props.ownerText : this.props.memberText } />
          </Persona>
      );
  }

  private _getPersona(personaControl: JSX.Element, persona: IGroupMemberPersona, index: number): JSX.Element {
      return <div
          className='ms-groupMember-itemBtn'
          title={ persona.name }
          key={ index }>
          <div className='ms-groupMember-personName'>{ personaControl }</div>
          </div>;
  }

  /**
   * Get the formatted message to display for large groups, including a link to Outlook
   */
  private _getLargeGroupMessage() {
    let largeGroupMessage = null;
    if (this.props.largeGroupMessage &&
      this.props.largeGroupMessage.indexOf('{0}') !== -1 &&
      this.props.outlookLinkText) {
      // largeGroupMessage uses the '{0}' token to indicate the position of the inline link.
      const largeGroupMessageSplit = this.props.largeGroupMessage.split('{0}');

      if (largeGroupMessageSplit.length === 2) {
        largeGroupMessage = (
          <p>
            <FocusZone>
              <span>
                { largeGroupMessageSplit[0] }
              </span>
              <Link href={ this.props.membersUrl } onClick={ this._logLargeGroupOutlookClick } target={ '_blank' } className='ms-MessageBar-link'>
                { this.props.outlookLinkText }
              </Link>
              <span>
                { largeGroupMessageSplit[1] }
              </span>
            </FocusZone>
          </p>
        );
      }
    }
    return largeGroupMessage;
  }

  /**
   * Need to use non-default query parameters for the PeoplePicker.
   * In particular, do not allow email addresses, external users, or groups (security groups and SharePoint groups)
   */
  private _getPeoplePickerQueryParams(): IPeoplePickerQueryParams {
    return {
        allowEmailAddresses: false, // Cannot type in email addresses
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
        filterExternalUsers: true, // Filter out external users
        blockExternalUsers: true // Cannot add external users
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
    Engagement.logData({ name: 'GroupMembershipPanel.PeoplePicker.Cancel' });
    this.setState({
      isAddingMembers: false,
      selectedMembers: [] // Must manually reset selected members before navigating away
    });
    this.props.clearErrorMessage();
  }

  @autobind
  private _onDoneClick() {
    Engagement.logData({ name: 'GroupMembershipPanel.PeoplePicker.Save' });

    // clear any error message from previous attempts
    this.props.clearErrorMessage();

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
            selectedMembers: [], // Must manually reset selected members before navigating away
            showSavingSpinner: false,
            saveButtonDisabled: false
          });
          this.props.clearErrorMessage();
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
      this.setState({
        isAddingMembers: false,
        selectedMembers: []
      });
      this.props.clearErrorMessage();
    }
  }

  /**
   * When a user clicks the link to view a large group in Outlook, log the event before
   * navigating away.
   */
  @autobind
  private _logLargeGroupOutlookClick(): boolean {
    Engagement.logData({ name: 'GroupMembershipPanel.LargeGroupOutlookLink.Click' });
    return true;
  }

  @autobind
  private _onSelectedMembersChange(selectedPersonas: IPerson[]): void {
    this.setState({ selectedMembers: selectedPersonas });
  }

  /**
   * When you switch between viewing the members list and adding members,
   * also clear any error messages.
   * 
   * @param {boolean} newState - true to choose the adding members state, false for the members list
   */
  private _setIsAddingMembers(newState: boolean): void {
    this.setState({
      isAddingMembers: newState
    });
    this.props.clearErrorMessage();
  }
}
