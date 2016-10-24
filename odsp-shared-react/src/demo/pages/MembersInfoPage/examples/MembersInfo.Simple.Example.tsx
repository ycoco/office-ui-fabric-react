import * as React from 'react';
import { MembersInfo, IMembersInfoProps } from '../../../../components/MembersInfo/index';

export class MembersInfoExample extends React.Component<React.Props<MembersInfoExample>, {}> {
  constructor() {
    super();
  }

  public render() {
    let sampleProps: IMembersInfoProps = {
        membersText: '5 members',
        goToMembersAction: (e:  React.MouseEvent) => {
            alert ('you clicked on members');
        }
    };

    return (
      <MembersInfo {...sampleProps} />
    );
  }
}
