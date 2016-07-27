import * as React from 'react';
import './MemberCount.scss';
import { IMemberCountProps } from './MemberCount.Props';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';

/**
 * Member Count control
 */
export class MemberCount extends React.Component<IMemberCountProps, {}> {

  constructor(props: IMemberCountProps) {
    super(props);
    this._onGoToMembersClick = this._onGoToMembersClick.bind(this);
  }

  public render() {
    const personIcon = (<i className='ms-Icon ms-Icon--person'></i>);
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
        <span>
          { personIcon }
          { membersCount }
        </span>
      );
    }

  private _onGoToMembersClick(ev: React.MouseEvent) {
    if (this.props.goToMembersAction) {
      this.props.goToMembersAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }
}
