import * as React from 'react';
import { MemberCount } from './MemberCount';

export interface IMemberCountProps extends React.Props<MemberCount> {
  /**
   * Text displaying how many members are part of this site.
   */
  membersText: string;

  /**
   * This method will get called when the text in membersText is clicked.
   */
  goToMembersAction?: (ev: React.MouseEvent) => void;

}
