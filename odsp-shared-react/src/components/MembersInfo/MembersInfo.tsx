import * as React from 'react';
import './MembersInfo.scss';
import { IMembersInfoProps } from './MembersInfo.Props';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { ContextualMenu, DirectionalHint } from 'office-ui-fabric-react/lib/ContextualMenu';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';

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
    let { membersText, goToMembersAction, onJoined, onLeaveGroup, isMemberOfCurrentGroup, enableJoinLeaveGroup } = this.props;
    let { isLeaveGroupVisible } = this.state;
    const verticalBar = (<div className='ms-membersInfo-verticalBar'>|</div>);
    const personIcon = (<i className='ms-Icon ms-Icon--Contact'></i>);
    const membersCount = (
      <span
        className='ms-membersInfo-membersNumber ms-font-s-plus'
        data-automationid='NumberOfMembersText'>
          { membersText }
      </span>);
    let membersCountButton: JSX.Element;
    let joined: JSX.Element;
    let leaveGroupContextualMenu: JSX.Element;
    let joinedMenuItems = [];

    if (goToMembersAction) {
      membersCountButton = (
        <Button buttonType={ ButtonType.command } onClick={ this._onGoToMembersClick } data-automationid='MemberCountButton'>
          { personIcon }
          { membersCount }
        </Button>
      );
    } else {
      membersCountButton = (
        <span className='ms-membersInfo-membersNumber--buttonEmulate'>
          { personIcon }
          { membersCount }
        </span>
      );
    }

    if (enableJoinLeaveGroup && isMemberOfCurrentGroup) {
      if (onJoined && onJoined.onJoinedString) {
        joined = (
          <Button
            className='ms-membersInfo-joinedButton'
            buttonType={ ButtonType.command }
            onClick={ this._onJoinedClick }
            data-automationid='JoinedButton'
          >
            { <span className='ms-membersInfo-joinedText ms-font-s-plus' ref={ this._resolveRef('_joinedElement') }>
                { onJoined.onJoinedString }
              </span> }
            { <i className='ms-Icon ms-Icon--ChevronDown'></i> }
          </Button>);
      }

      if (onLeaveGroup && onLeaveGroup.onLeaveGroupString) {
          joinedMenuItems.push({ name: onLeaveGroup.onLeaveGroupString, className: 'ms-membersInfo-joinedButtonContextualMenu-leaveGroup', key: 'leavegroup', onClick: this._onLeaveGroupClick });
      }

      if (onJoined && onJoined.onJoinedString && joinedMenuItems.length > 0) {
        leaveGroupContextualMenu = (
          <FocusZone direction={ FocusZoneDirection.vertical }>
              <ContextualMenu
                targetElement={ this._joinedElement }
                directionalHint={ DirectionalHint.bottomLeftEdge }
                items={ joinedMenuItems }
                isBeakVisible={ false }
                gapSpace={ 5 }
                onDismiss={ this._onDismissMenu }
                className='ms-membersInfo-joinedButtonContextualMenu'
                data-automationid='JoinedButtonContextualMenu'
              />
          </FocusZone>);
      }
    }

    // This is temporary member number render, which link to OWA membership experience until we build our own.
    return (
      <div className='ms-membersInfo-infoArea'>
        { membersCountButton }
        { enableJoinLeaveGroup && isMemberOfCurrentGroup ? verticalBar : null }
        { enableJoinLeaveGroup && isMemberOfCurrentGroup ? joined : null }
        { isLeaveGroupVisible ? leaveGroupContextualMenu : null }
      </div>
    );
  }

  @autobind
  private _onGoToMembersClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    if (this.props.goToMembersAction) {
      this.props.goToMembersAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  @autobind
  private _onJoinedClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    this.setState({
      isLeaveGroupVisible: !this.state.isLeaveGroupVisible
    });

    if (this.props.onJoined && this.props.onJoined.onJoinedAction) {
      this.props.onJoined.onJoinedAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  @autobind
  private _onLeaveGroupClick(ev: React.MouseEvent<HTMLElement>) {
    if (this.props.onLeaveGroup && this.props.onLeaveGroup.onLeaveGroupAction) {
      this.props.onLeaveGroup.onLeaveGroupAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  @autobind
  private _onDismissMenu(ev: React.MouseEvent<HTMLElement>) {
    this.setState({
      isLeaveGroupVisible: false
    });
    ev.stopPropagation();
    ev.preventDefault();
  }
}
