import * as React from 'react';
import './MemberCount.scss';
import { IMemberCountProps } from './MemberCount.Props';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';

/**
 * Member Count control
 */
export class MemberCount extends React.Component<IMemberCountProps, {}> {
  public render() {
    const personIcon = (<i className='ms-Icon ms-Icon--Contact'></i>);
    const membersCount = (<span className='ms-memberCountNumMembersText ms-font-s-plus'>{ this.props.membersText }</span>);

    // This is temporary member number render, which link to OWA membership experience until we build our own.
    return this.props.goToMembersAction ? (
      <span>
        <Button buttonType={ ButtonType.command } onClick={ this._onGoToMembersClick }>
          { personIcon }
          { membersCount }
        </Button>
      </span>
    ) : (
        <span className='ms-memberCountNumMembers-buttonEmulate'>
          { personIcon }
          { membersCount }
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
}
