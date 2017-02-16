import * as React from 'react';

import './DotDotDotRenderer.scss';

export interface IDotDotDotRendererProps {
    onClick: (evt: React.MouseEvent<HTMLButtonElement>) => void;
    isDisabled?: boolean;
    ariaLabel?: string;
}

export function DotDotDotRenderer(props: IDotDotDotRendererProps) {
    'use strict';

    let { onClick, isDisabled, ariaLabel } = props;

    let dotDotDotClass = 'ms-Icon ms-Icon--More';

    // use special styling if item is disabled
    if (isDisabled) {
        dotDotDotClass += ' od-FieldRenderer--disabled';
    }

    return (
        <button
            className='od-FieldRenderer-dot'
            role='button'
            onClick={ onClick }
            aria-label={ ariaLabel }
            aria-haspopup='true'
            data-is-focusable='true'
        >
            <i className={ dotDotDotClass } />
        </button>
    );
}
