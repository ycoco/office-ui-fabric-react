import * as React from 'react';
import { MemberCount, IMemberCountProps } from '../../../../components/MemberCount/index';

export class MemberCountExample extends React.Component<React.Props<MemberCountExample>, {}> {
  constructor() {
    super();
  }

  public render() {
    let sampleProps: IMemberCountProps = {
        membersText: '5 members',
        goToMembersAction: (e:  React.MouseEvent) => {
            alert ('you clicked on members');
        }
    };

    return (
      <MemberCount {...sampleProps} />
    );
  }
}
