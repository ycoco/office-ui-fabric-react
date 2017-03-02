import './SharePolicyDetails.scss';
import { Link } from 'office-ui-fabric-react/lib/Link';
import * as React from 'react';

// TODO (joem): Create string resources for items not returned via API.
export class SharePolicyDetails extends React.Component<{}, {}> {
    public render(): React.ReactElement<{}> {
        return (
            <div className='od-SharePolicyDetails'>
                <div className='od-Share-header od-Share-header--multiline'>
                    <div className='od-Share-title ms-font-l ms-fontWeight-regular'>Share Link</div>
                    <div className='od-Share-fileName ms-font-xs'>TODO (joem): Pass file name here.</div>
                </div>
                <div className='od-SharePolicyDetails-content'>
                    <div className='od-SharePolicyDetails-title'>Policies</div>
                    <div className='od-SharePolicyDetails-description'>This item cannot be shared with people outside your organization because of the following issues.</div>
                    <div className='od-SharePolicyDetails-issues'>
                        <div className='od-SharePolicyDetails-issuesIcon'><i className='ms-Icon ms-Icon--Blocked2'></i></div>
                        <div className='od-SharePolicyDetails-issuesTitle'>Issues</div>
                        <ul className='od-SharePolicyDetails-issuesList'>
                            <li className='od-SharePolicyDetails-issue'>Item contains the following sensitive information: Credit card numbers(s), Social Security number(s)</li>
                            <li className='od-SharePolicyDetails-issue'>Item contains the following document properties: confidence.high, classification.HBI</li>
                        </ul>
                    </div>
                    <div className='od-SharePolicyDetails-timeStamp'>Last scanned: 1:55pm</div>
                    <div className='od-SharePolicyDetails-learnMore'><Link>Learn more</Link> about your organization's policies</div>
                    <div className='od-SharePolicyDetails-override'>Think this item doesn't conflict with your organization's policies? <Link>Report an issue</Link> to let your admin know. Override the policy if you have business justification. All Policy overrides are recorded.</div>
                    <Link className='od-SharePolicyDetails-overrideToggle'>
                        <div className='od-SharePolicyDetails-overrideToggle-icon'>
                            <i className='ms-Icon ms-Icon--CheckMark'></i>
                        </div>
                        <div className='od-SharePolicyDetails-overrideToggle-text'>Policy overriden. Close to continue with sharing.</div>
                    </Link>
                </div>
            </div>
        );
    }
}