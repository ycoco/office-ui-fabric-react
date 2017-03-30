import * as React from 'react';
import { PolicyTip, IPolicyTipProps, IPolicyTipStrings } from '../../../../components/PolicyTip/index';

export class PolicyTipExample extends React.Component<React.Props<PolicyTipExample>, {}> {
    private _strings: IPolicyTipStrings;

    constructor() {
        super();

        this._strings = {
            headerText: 'Issues',
            issues: ['Too many spelling mistakes.', 'Document is boring.'],
            lastScannedText: 'Last scanned some time ago.',
            learnMoreActionLabel: 'Learn more',
            learnMoreLabel: '{0} about this policy.',
            learnMoreUrl: 'http://www.bing.com',
            noPolicyTipInfoError: undefined,
            overrideActionLabel: 'Override',
            overrideLabel: '{0} this policy.',
            policyTipDescription: `There's a policy on this document, so you can't do anything.`,
            reportActionLabel: 'Report',
            reportInProgressLabel: 'Recording your response...',
            reportLabel: '{0} this policy because it is wrong.',
            submitButtonLabel: 'Submit',
            titleText: `Policy tip for 'foo.docx'`
        };
    }

    public render() {
        const exampleProps: IPolicyTipProps = {
            confirmationText: undefined,
            onDismissed: () => { alert('Callback for when component unmounts.'); },
            onOverrideClicked: () => { alert('Callback for when override is clicked.'); },
            onOverrideSubmitClicked: (justification?: string) => { alert(`Override clicked with "${justification}" justification.`) },
            onReportClicked: () => { alert('Callback for when report is clicked.'); },
            overrideRequiresJustification: false,
            showJustificationInput: false,
            strings: this._strings
        };

        return (
            <PolicyTip {...exampleProps} />
        );
    }
}
