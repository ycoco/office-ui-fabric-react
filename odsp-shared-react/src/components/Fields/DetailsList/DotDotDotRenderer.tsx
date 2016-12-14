/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import './DotDotDotRenderer.scss';
// import '../ReactDetailsList.css';

import { ISPListItem } from '@ms/odsp-datasources/lib/dataSources/item/spListItemProcessor/ISPListItemData';

export interface IDotDotDotRendererProps {
    item: ISPListItem;
    strings: {
        showDetailsAriaLabel: string;
    };
}

export function DotDotDotRenderer(props: IDotDotDotRendererProps) {
    'use strict';

    let { item, strings } = props;

    // use special styling if item is disabled
    let dotDotDotClass = 'ms-Icon ms-Icon--More';

    if (item && item.properties.isDisabled) {
        dotDotDotClass += ' od-FieldRenderer--disabled';
    }

    // simulate right clicking on the list item to open the context menu
    let onClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
        let menuEvent = document.createEvent('CustomEvent');

        menuEvent.initCustomEvent('contextmenu', true /*canBubble*/, true /*cancelable*/, evt);
        evt.currentTarget.dispatchEvent(menuEvent);
        Engagement.logData({ name: 'Ellipsis.Callout.Click' });

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
