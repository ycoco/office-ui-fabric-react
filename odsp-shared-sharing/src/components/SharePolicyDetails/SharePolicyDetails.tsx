import './SharePolicyDetails.scss';
import { getRelativeDateTimeStringPast } from '@ms/odsp-utilities/lib/dateTime/DateTime';
import { Header } from '../Header/Header';
import {
    ISharingInformation, ISharingItemInformation, ClientId, IShareStrings, ISharingStore, IPolicyTipInformation
} from '../../interfaces/SharingInterfaces';
import { PolicyTip, IPolicyTipProps, IPolicyTipStrings } from '@ms/odsp-shared-react/lib/PolicyTip';
import { ShareViewState } from '../Share/Share';
import * as React from 'react';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { RuleOverrideOptions, PolicyTipUserActionResult, PolicyTipUserAction } from '@ms/odsp-datasources/lib/PolicyTip';

export interface ISharePolicyDetailsProps {
    clientId: ClientId;
    sharingInformation: ISharingInformation;
    policyTipInformation: IPolicyTipInformation;
}

export interface ISharePolicyDetailsState {
    showJustificationInput: boolean;
}

export class SharePolicyDetails extends React.Component<ISharePolicyDetailsProps, ISharePolicyDetailsState> {
    private _strings: IShareStrings;
    private _store: ISharingStore;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired,
        sharingStore: React.PropTypes.object.isRequired
    };

    constructor(props: ISharePolicyDetailsProps, context: any) {
        super(props);

        this._strings = context.strings;
        this._store = context.sharingStore;

        this.state = {
            showJustificationInput: false
        };
    }

    public render(): React.ReactElement<{}> {
        const props = this.props;
        const state = this.state;
        const strings = this._strings;

        const ptInfo = props.policyTipInformation.info;

        return (
            <div className='od-SharePolicyDetails'>
                <Header
                    clientId={ props.clientId }
                    item={ props.sharingInformation.item }
                    viewState={ ShareViewState.policyDetails }
                />
                <div className='od-Share-PolicyTip'>
                    <PolicyTip
                        confirmationText={ this._getConfirmationText() }
                        onDismissed={ () => { return; } }
                        onOverrideClicked={ this._onOverrideClicked }
                        onOverrideSubmitClicked={ this._onOverrideSubmitClicked }
                        overrideRequiresJustification={ !!ptInfo ? ptInfo.overrideOption === RuleOverrideOptions.allowWithJustification : undefined }
                        showJustificationInput={ state.showJustificationInput }
                        onReportClicked={ this._onReportClicked }
                        strings={ this._getStrings() }
                    />
                </div>
            </div>
        );
    }

    private _getStrings(): IPolicyTipStrings {
        const ptInfo = this.props.policyTipInformation.info;
        const strings = this._strings;

        const showOverrideAction = ptInfo && (ptInfo.overrideOption === RuleOverrideOptions.allow || ptInfo.overrideOption === RuleOverrideOptions.allowWithJustification);

        return {
            headerText: strings.ptHeader,
            issues: ptInfo ? ptInfo.issueDescriptions : undefined,
            lastScannedText: ptInfo ? (ptInfo.lastScanned ? `${ strings.ptLastScanned }: ${ getRelativeDateTimeStringPast(ptInfo.lastScanned) }` : undefined) : undefined,
            learnMoreActionLabel: ptInfo ? strings.ptLearnMoreActionLabel : undefined,
            learnMoreLabel: ptInfo ? strings.ptLearnMoreLabel : undefined,
            learnMoreUrl: ptInfo ? ptInfo.policyInfoUrl : undefined,
            noPolicyTipInfoError: ptInfo ? undefined: strings.ptNoPolicyTipInfo,
            overrideActionLabel: showOverrideAction ? strings.ptOverrideActionLabel : undefined,
            overrideLabel: strings.ptOverrideLabel,
            policyTipDescription: ptInfo ? ptInfo.explanationText : undefined,
            reportActionLabel: strings.ptReportActionLabel,
            reportLabel: strings.ptReportLabel,
            reportInProgressLabel: strings.ptReportInProgress,
            submitButtonLabel: strings.ptSubmitLabel,
            titleText: undefined
        };
    }

    private _getConfirmationText(): string {
        const actionResult = this.props.policyTipInformation.actionResult;

        if (actionResult === null) {
            return '';
        } else if (actionResult === PolicyTipUserActionResult.falsePositiveReported) {
            return this._strings.ptReportConfirmation;
        } else if (actionResult === PolicyTipUserActionResult.overridden ||
            actionResult === PolicyTipUserActionResult.falsePositiveReportedAndOverridden) {
            return this._strings.ptOverrideConfirmation;
        } else {
            return '';
        }
    }

    /**
     * This either overrides the policy (without justification) or notifies
     * the UI to show the justification input.
     */
    @autobind
    private _onOverrideClicked() {
        const overrideOption = this.props.policyTipInformation.info.overrideOption;

        if (overrideOption === RuleOverrideOptions.allow) {
            this._store.updatePolicy(PolicyTipUserAction.override);
        } else if (overrideOption === RuleOverrideOptions.allowWithJustification) {
            this.setState({
                ...this.state,
                showJustificationInput: true
            });
        }
    }

    @autobind
    private _onOverrideSubmitClicked(justificationText: string) {
        this._store.updatePolicy(PolicyTipUserAction.override, justificationText);
    }

    @autobind
    private _onReportClicked() {
        this._store.updatePolicy(PolicyTipUserAction.reportFalsePositive);
    }
}