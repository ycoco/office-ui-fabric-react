/**
 * Ideally this should be in odsp-shared-react. However, this component is used in odsp-list-utilities
 * and odsp-shared-react already depends on odsp-list-utilities, so keeping it here to avoid circular
 * project dependencies.
 * We need to break odsp-list-utilities into a lower-level and a higher-level project.
 */

import * as React from 'react';
import { autobind, css, Async, Icon, IconName } from 'office-ui-fabric-react';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';
import { IProgressCommandProps, ProgressState, ProgressType, IProgress, IProgressStrings, PROGRESS_UPDATE } from './ProgressCommand.Props';
import './ProgressCommand.scss';

const PROGRESS_DISMISS_INTERVAL: number = 4000;

export interface IProgressCommandState {
    isVisible: boolean;
    text?: string;
    icon?: string;
}

interface IStringsDictionary {
    [type: number]: {
        started: string;
        completed: string;
        failed: string;
    };
}

export class ProgressCommand extends React.Component<IProgressCommandProps, IProgressCommandState> {
    private _events: EventGroup;
    private _async: Async;
    private _progressTimeout: number;
    private _stringsDictionary: {  };

    constructor(props: IProgressCommandProps) {
        super(props);

        this._async = new Async(this);
        this._events = new EventGroup(this.props.eventContainer);
        this._events.on(this.props.eventContainer, PROGRESS_UPDATE, this._onUpdateProgress);

        this._stringsDictionary = this._buildStringsDictionary(this.props.strings);

        this.state = {
            isVisible: false
        };
    }

    public render() {
        let { isVisible, text, icon } = this.state;

        if (!isVisible) {
            return null;
        } else {
            const className = 'ms-CommandBarItem-text ms-progressCommand-text';
            const iconClassName = css('ms-CommandBarItem-icon ms-progressCommand-icon',
                    icon === 'sync' ? 'ms-progressCommand-animateIcon' : ''
                );
            const textClassName = 'ms-CommandBarItem-commandText ms-progressCommand-itemtext ms-font-m ms-font-weight-regular';
            let iconProps = {
                iconName: icon as IconName
            };
            return (
                <div id='progress' className={ className } aria-haspopup={ false }>
                    <Icon { ...iconProps } className={ iconClassName } />
                    <span className={ textClassName } aria-hidden='true' role='presentation'>
                        { text }
                    </span>
                </div>
            );
        }
    }

    @autobind
    private _onUpdateProgress(progress: IProgress) {
        const { strings } = this.props;
        const { state, type, totalCount, successCount, failureCount } = progress;

        this._async.clearTimeout(this._progressTimeout);

        let icon: string;
        let text: string;
        let dismissProgress: boolean = false;

        switch (state) {
            case ProgressState.started:
                icon = 'sync';
                text = StringHelper.formatWithLocalizedCountValue(
                    this._stringsDictionary[type].started,
                    strings.ProgressCountTemplateInterval,
                    progress.totalCount
                );
                break;
            case ProgressState.completed:
                icon = 'checkMark';
                text = StringHelper.formatWithLocalizedCountValue(
                    this._stringsDictionary[type].completed,
                    strings.ProgressCountTemplateInterval,
                    progress.successCount
                );
                dismissProgress = true;
                break;
            case ProgressState.failed:
                icon = 'statusErrorFull';
                text = StringHelper.formatWithLocalizedCountValue(
                    this._stringsDictionary[type].failed,
                    strings.ProgressCountTemplateInterval,
                    progress.failureCount
                );
                dismissProgress = true;
                break;
        }

        this.setState({
            isVisible: true,
            icon: icon,
            text: text
        });

        if (dismissProgress) {
            this._progressTimeout = this._async.setTimeout(() => {
                this.setState({
                    isVisible: false
                });
            }, PROGRESS_DISMISS_INTERVAL);
        }
    }

    private _buildStringsDictionary(strings: IProgressStrings) {
        let dictionary: IStringsDictionary = {};

        dictionary[ProgressType.uploadItems] = {
            started: strings.UploadProgressStart,
            completed: strings.UploadProgressComplete,
            failed: strings.UploadProgressFailed
        }

        return dictionary;
    }
}

export default ProgressCommand;
