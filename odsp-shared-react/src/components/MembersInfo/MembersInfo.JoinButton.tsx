import * as React from 'react';
import './MembersInfo.scss';
import { IMembersInfoProps } from './MembersInfo.Props';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';

/**
 * enum to represent the user's join status to current group
 */
export enum membersInfoJoinStatus {
  joined,
  joining,
  unjoin,
  joinLeaveError,
  leaving
}

/**
 * Members Info Join Button state
 */
export interface IMembersInfoJoinButtonState {
  joinStatus?: membersInfoJoinStatus;
}

/**
 * Members Info Join Button control
 */
export class MembersInfoJoinButton extends BaseComponent<IMembersInfoProps, IMembersInfoJoinButtonState> {
  constructor(props: IMembersInfoProps) {
    super(props);

    this.state = this.GetInitialState();
  }

  public GetInitialState() {
    let joinStatus = this._getJoinStatus(this.props);

    return { joinStatus: joinStatus };
  }

  public componentWillReceiveProps(nextProps: IMembersInfoProps) {
    let joinStatus = this._getJoinStatus(nextProps);

    this.setState({
      joinStatus: joinStatus
    });
  }

  public render() {
    let { onJoin, joinLeaveError, onLeaveGroup } = this.props;
    let { joinStatus } = this.state;

    let joinButtonRender: JSX.Element;

    if (joinStatus === membersInfoJoinStatus.unjoin) {
      joinButtonRender = (
        <Button
          className='ms-membersInfo-joinButton'
          buttonType={ ButtonType.primary }
          onClick={ this._onJoinClick }
          data-automationid='JoinButton'
          >
          { onJoin.onJoinString }
        </Button>);
    } else if (joinStatus === membersInfoJoinStatus.joining) {
      joinButtonRender = (
        <span className='ms-membersInfo-joinButton--joining'>
          <Spinner className='ms-membersInfo-joinButton-spinner' label={ onJoin.onJoiningString } />
        </span>);
    } else if (joinStatus === membersInfoJoinStatus.leaving) {
      joinButtonRender = (
        <span className='ms-membersInfo-joinButton--leaving'>
          <Spinner className='ms-membersInfo-joinButton-spinner' label={ onLeaveGroup.onLeavingGroupString } />
        </span>);
    } else if (joinStatus === membersInfoJoinStatus.joinLeaveError) {
      joinButtonRender = (
        <span className='ms-membersInfo-joinButton--joinLeaveError'>
          <span className='ms-membersInfo-joinButton--joinLeaveErrorText'>
            { joinLeaveError }
          </span>
          <i className='ms-Icon ms-Icon--Cancel ms-membersInfo-joinButton--dismiss' onClick={ this._onErrorDismissClick } />
        </span>
      );
    } else {
      joinButtonRender = null;
    }

    return joinButtonRender;
  }

  @autobind
  private _onJoinClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    this.setState({
      joinStatus: membersInfoJoinStatus.joining
    });

    if (this.props.onJoin.onJoinAction) {
      this.props.onJoin.onJoinAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  @autobind
  private _onErrorDismissClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    if (this.props.isMemberOfCurrentGroup) {
      this.setState({
        joinStatus: membersInfoJoinStatus.joined
      });
    } else {
       this.setState({
        joinStatus: membersInfoJoinStatus.unjoin
      });
    }

    if (this.props.onErrorDismissClick) {
      this.props.onErrorDismissClick(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  private _getJoinStatus(props: IMembersInfoProps): membersInfoJoinStatus {
    let joinStatus: membersInfoJoinStatus;

    if (props.isMemberOfCurrentGroup && props.isLeavingGroup) {
      joinStatus = membersInfoJoinStatus.leaving;
    } else if (props.joinLeaveError) {
      joinStatus = membersInfoJoinStatus.joinLeaveError;
    } else if (props.isMemberOfCurrentGroup) {
      joinStatus = membersInfoJoinStatus.joined;
    } else {
      joinStatus = membersInfoJoinStatus.unjoin;
    }

    return joinStatus;
  }
}
