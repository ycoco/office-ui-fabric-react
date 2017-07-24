import * as React from 'react';
import { IBaseProps } from 'office-ui-fabric-react';

import { PolicyTip, IPolicyTipStrings } from './PolicyTip';

export interface IPolicyTipProps extends React.Props<PolicyTip>, IBaseProps {
  /**
   * Action response text after a report or override action completes.
   */
  confirmationText: string;
  /**
   * Callback when component gets unmounted.
   */
  onDismissed: () => void;
  /**
   * Callback for when "Override" button is clicked in UI to override policy tip or show justification UI.
   */
  onOverrideClicked: () => void;
  /**
   * Callback for when submit button is clicked in UI to override policy tip with justification.
   */
  onOverrideSubmitClicked: (justification?: string) => void;
  /**
   * Callback for when "Report" button is clicked in UI to report a false positive about policy tip.
   */
  onReportClicked: () => void;
  /**
   * Property that notifies UI that overriding policy tip requires justification from user.
   */
  overrideRequiresJustification: boolean;
  /**
   * Property that notifies UI that justification input should be shown.
   */
  showJustificationInput: boolean;
  /**
   * Collection of strings required by the UI.
   */
  strings: IPolicyTipStrings;
}