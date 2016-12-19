/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import { ABExperiment } from '@ms/odsp-utilities/lib/logging/ABExperiment';
import './DotDotDotRenderer.scss';
// import '../ReactDetailsList.css';

export interface IDotDotDotRendererProps {
    isDisabled?: boolean;
    strings: {
        showDetailsAriaLabel: string;
    };
    switches?: {
        dot3Experiment?: boolean;
    };
}

export function DotDotDotRenderer(props: IDotDotDotRendererProps) {
    'use strict';

    let { isDisabled, strings, switches } = props;
    switches = switches || {};

    // use special styling if item is disabled
    let dotDotDotClass = 'ms-Icon ms-Icon--More';

    if (isDisabled) {
        dotDotDotClass += ' od-FieldRenderer--disabled';
    }

    // simulate right clicking on the list item to open the context menu
    let onClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
        let menuEvent = document.createEvent('CustomEvent');

        menuEvent.initCustomEvent('contextmenu', true /*canBubble*/, true /*cancelable*/, evt);
        evt.currentTarget.dispatchEvent(menuEvent);

        // add the logging part for an experiment that shows to 10%
        // of the users the dotdotdot
        let dot3Experiment = undefined;
        if (switches.dot3Experiment) {
            dot3Experiment = new ABExperiment({
                name: 'Dot3ShowTo10',
                startDate: '12/09/2016',
                segmentPopulation: 0.1
            });
        }
        Engagement.logData({
            name: 'Ellipsis.Callout.Click',
            experiment: dot3Experiment
        });

        evt.preventDefault();
        evt.stopPropagation();
    };

    return (
        <button
            className='od-FieldRenderer-dot'
            role='button'
            onClick={ onClick }
            aria-label={ strings.showDetailsAriaLabel }
            aria-haspopup='true'
            data-is-focusable='true'
        >
            <i className={ dotDotDotClass } />
        </button>
    );
}
