import './PolicyTip.scss';
import { autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';
import { IPolicyTipProps } from './PolicyTip.Props';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as React from 'react';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');

export interface IPolicyTipState {
  isLoading: boolean;
  justificationText: string;
  overrideButtonClicked: boolean;
  overrideSubmitClicked: boolean;
  overrideSubmitDisabled: boolean;
  reportButtonClicked: boolean;
}

export interface IPolicyTipStrings {
  headerText: string;
  issues: Array<string>;
  lastScannedText: string;
  learnMoreActionLabel: string;
  learnMoreLabel: string; // Second part of learn more action.
  learnMoreUrl: string;
  noPolicyTipInfoError: string;
  overrideActionLabel: string; // If empty string, don't show override action.
  overrideLabel: string; // Second part of override label.
  policyTipDescription: string;
  reportActionLabel: string;
  reportInProgressLabel: string;
  reportLabel: string; // Second part of report action.
  submitButtonLabel: string;
  titleText: string;
}

export class PolicyTip extends BaseComponent<IPolicyTipProps, IPolicyTipState> {
  constructor(props: IPolicyTipProps) {
    super(props);

    this.state = {
      isLoading: false,
      justificationText: '',
      reportButtonClicked: false,
      overrideButtonClicked: false,
      overrideSubmitClicked: false,
      overrideSubmitDisabled: props.overrideRequiresJustification
    };
  }

  public componentWillReceiveProps(nextProps: IPolicyTipProps, nextState: IPolicyTipState) {
    if (this.state.isLoading && !!nextProps.confirmationText) {
      this.setState({
        ...this.state,
        isLoading: false
      });
    }
  }

  public componentWillUnmount() {
    this.props.onDismissed();
  }

  public render() {
    const strings = this.props.strings;

    const content = strings.noPolicyTipInfoError ?
      (
        <div className='od-PolicyTip-container'>
          <span className='od-PolicyTip-error'>{ strings.noPolicyTipInfoError }</span>
        </div>
      ) :
      (
        <div className='od-PolicyTip-container'>
          <span className='od-PolicyTip-description'>{ strings.policyTipDescription }</span>
          <div className='od-PolicyTip-header'>
            <i className='od-PolicyTip-blockedIcon ms-Icon ms-Icon--Blocked2'></i>
            <span className='od-PolicyTip-headerText'>{ strings.headerText }</span>
          </div>
          { this._renderIssues() }
          <span className='od-PolicyTip-minorText'>{ strings.lastScannedText }</span>
          { this._renderLearnMore() }
          <div className='od-PolicyTip-actions'>
            { this._renderActions() }
          </div>
          { this._renderJustificationInput() }
          { this._renderStatus() }
        </div>
      );

    return (
      <div>
        <h2 className='od-PolicyTip-title'>{ strings.titleText }</h2>
        { content }
      </div>
    );
  }

  private _renderIssues() {
    const issues = [];
    let index = 0;

    for (const issue of this.props.strings.issues) {
      issues.push(
        <span className='od-PolicyTip-issue' key={ index++ }>{ issue }</span>
      );
    }

    return issues;
  }

  private _renderLearnMore() {
    const strings = this.props.strings;

    if (strings.learnMoreUrl) {
      // Define anchor with href.
      const learnActionJsx = (
        <a
          href={strings.learnMoreUrl}
          target='_blank'
        >{strings.learnMoreActionLabel}</a>
      );

      // Insert JSX into string.
      const learnAction = StringHelper.formatToArray(strings.learnMoreLabel, learnActionJsx);

      return (
        <div
          className='od-PolicyTip-learnMoreContainer od-PolicyTip-minorText'
          >
          {learnAction}
        </div>
      );
    }
  }

  private _getAction(label: string, actionLabel: string, isClicked: boolean, callback?: () => void) {
    if (isClicked) {
      return (
        <div className='od-PolicyTip-action'>
          <span>{ `${StringHelper.format(label, actionLabel)}` }</span>
        </div>
      );
    } else {
      // Define action text with click handler.
      const anchorJsx = (
        <a
          className='od-PolicyTip-actionLabel'
          onClick={callback}
          role='button'
          href='javascript:;'
        >{actionLabel}</a>
      );

      // Insert anchorJsx into string.
      const action = StringHelper.formatToArray(label, anchorJsx);

      return (
        <div className='od-PolicyTip-action'>
          {action}
        </div>
      );
    }
  }

  private _renderActions() {
    const props = this.props;
    const state = this.state;
    const strings = props.strings;
    const actions = [];

    // Report action is always available.
    const reportAction = this._getAction(strings.reportLabel, strings.reportActionLabel, state.reportButtonClicked, this._onReportClicked);
    actions.push(reportAction);

    // If override action text is defined, add it.
    if (strings.overrideActionLabel) {
      const overrideAction = this._getAction(strings.overrideLabel, strings.overrideActionLabel, state.overrideButtonClicked, this._onOverrideClicked);
      actions.push(overrideAction);
    }

    return actions;
  }

  private _renderStatus() {
    const props = this.props;
    const state = this.state;

    if (state.isLoading) {
      return (
        <div className='od-PolicyTip-status'>
          <Spinner />
          <span className='od-PolicyTip-statusText'>{ props.strings.reportInProgressLabel }</span>
        </div>
      );
    } else if (props.confirmationText) {
      return (
        <div className='od-PolicyTip-status'>
          <span className='ms-Icon ms-Icon--CheckMark'></span>
          <span className='od-PolicyTip-statusText'>{ props.confirmationText }</span>
        </div>
      );
    }
  }

  private _renderJustificationInput() {
    const props = this.props;
    const state = this.state;

    if (props.showJustificationInput) {
      return (
        <div className='od-PolicyTip-justificationInputContainer'>
          <TextField
            autoAdjustHeight
            multiline
            onBeforeChange={ this._onJustificationChanged }
            underlined
            resizable={ false }
            />
          { !state.overrideSubmitClicked && (
            <PrimaryButton
              className='od-PolicyTip-submitButton'
              disabled={ state.overrideSubmitDisabled }
              onClick={ this._onOverrideSubmitClicked }
              >{ props.strings.submitButtonLabel }</PrimaryButton>
          ) }
        </div>
      )
    }
  }

  @autobind
  private _onReportClicked() {
    this.setState({
      ...this.state,
      isLoading: true,
      reportButtonClicked: true
    }, () => {
      this.props.onReportClicked();
    });
  }

  @autobind
  private _onOverrideClicked() {
    this.setState({
      ...this.state,
      overrideButtonClicked: true
    }, () => {
      this.props.onOverrideClicked();
    });
  }

  @autobind
  private _onOverrideSubmitClicked() {
    this.setState({
      ...this.state,
      isLoading: true,
      overrideSubmitClicked: true
    }, () => {
      this.props.onOverrideSubmitClicked(this.state.justificationText);
    });
  }

  @autobind
  private _onJustificationChanged(justification: string) {
    // If justification isn't required, then value of this text doesn't matter.
    if (!this.props.overrideRequiresJustification) {
      return;
    }

    this.setState({
      ...this.state,
      justificationText: justification,
      overrideSubmitDisabled: !justification
    });
  }
}