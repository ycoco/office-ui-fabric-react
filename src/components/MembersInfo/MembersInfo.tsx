import * as React from 'react';
import './MembersInfo.scss';
import { IMembersInfoProps } from './MembersInfo.Props';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { ContextualMenu, DirectionalHint } from 'office-ui-fabric-react/lib/ContextualMenu';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';
import { BaseComponent } from 'office-ui-fabric-react/lib/common/BaseComponent';

export interface IMembersInfoState {
  isLeaveGroupVisible?: boolean;
}

/**
 * Member Info control
 */
export class MembersInfo extends BaseComponent<IMembersInfoProps, IMembersInfoState> {

  private _joinedElement: HTMLElement;

  constructor(props: IMembersInfoProps) {
    super(props);
    this.state = {
      isLeaveGroupVisible: false
    };
  }

  public render() {
    let { membersText, goToMembersAction, onJoined, onLeaveGroup, isMemberOfCurrentGroup, isInGroupCard } = this.props;
    let { isLeaveGroupVisible } = this.state;
    const personIcon = (<i className='ms-Icon ms-Icon--Contact'></i>);
    const membersCount = (
      <span
        className='ms-membersInfoNumMembersText ms-font-s-plus'
        data-automationid='MembersText'>
          { membersText }
      </span>);
    let membersCountButton: JSX.Element;
    let joined: JSX.Element;
    let leaveGroupContextualMenu: JSX.Element;
    let joinedMenuItems = [];

    if (goToMembersAction) {
      membersCountButton = (
        <Button buttonType={ ButtonType.command } onClick={ this._onGoToMembersClick }>
          { personIcon }
          { membersCount }
        </Button>
      );
    } else {
      membersCountButton = (
        <span className='ms-membersInfoNumMembers-buttonEmulate'>
          { personIcon }
          { membersCount }
        </span>
      );
    }

    if (isMemberOfCurrentGroup && isInGroupCard) {
      joined = (
        <span>
          <span>{ '|' }</span>
          <Button
            className='ms-membersInfoJoinedButton'
            buttonType={ ButtonType.command }
            onClick={ this._onJoinedClick }
            data-automationid='JoinedButton'
          >
            { <span className='ms-membersInfoJoinedText ms-font-s-plus' ref={ this._resolveRef('_joinedElement') }>
                { onJoined.onJoinedString }
              </span> }
            { <i className='ms-Icon ms-Icon--ChevronDown'></i> }
          </Button>
        </span>);

      joinedMenuItems.push({ name: onLeaveGroup.onLeaveGroupString, key: 'leavegroup', onClick: this._onLeaveGroupClick });

      leaveGroupContextualMenu = (
        <FocusZone direction={ FocusZoneDirection.vertical }>
            <ContextualMenu
              targetElement={ this._joinedElement }
              directionalHint={ DirectionalHint.bottomLeftEdge }
              items={ joinedMenuItems }
              isBeakVisible={ false }
              gapSpace={ 5 }
              onDismiss={ this._onDismissMenu }
              className='ms-membersInfoJoinedButton_contextualMenu'
              data-automationid='JoinedButtonContextualMenu'
            />
        </FocusZone>);
    }

    // This is temporary member number render, which link to OWA membership experience until we build our own.
    return (
      <span>
        { membersCountButton }
        { isMemberOfCurrentGroup && isInGroupCard ? joined : null }
        { isLeaveGroupVisible ? leaveGroupContextualMenu : null }
      </span>
    );
  }

  @autobind
  private _onGoToMembersClick(ev: React.MouseEvent) {
    if (this.props.goToMembersAction) {
      this.props.goToMembersAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  @autobind
  private _onJoinedClick(ev: React.MouseEvent) {
    this.setState({
      isLeaveGroupVisible: !this.state.isLeaveGroupVisible
    });

    if (this.props.onJoined.onJoinedAction) {
      this.props.onJoined.onJoinedAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  @autobind
  private _onLeaveGroupClick(ev: React.MouseEvent) {
    if (this.props.onLeaveGroup.onLeaveGroupAction) {
      this.props.onLeaveGroup.onLeaveGroupAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  @autobind
  private _onDismissMenu(ev: React.MouseEvent) {
    this.setState({
      isLeaveGroupVisible: false
    });
    ev.stopPropagation();
    ev.preventDefault();
  }
}
