import './DotDotDotRenderer.scss';

import * as React from 'react';
import { css } from 'office-ui-fabric-react/lib/Utilities';

export interface IDotDotDotRendererProps {
    onClick: (evt: React.MouseEvent<HTMLButtonElement>) => void;
    isDisabled?: boolean;
    ariaLabel?: string;
}

export function DotDotDotRenderer(props: IDotDotDotRendererProps): JSX.Element {
    const { onClick, isDisabled, ariaLabel } = props;

    return (
        <button
            className={ css('od-FieldRenderer-dot', {
                'od-FieldRenderer--disabled': isDisabled
            }) }
            onClick={ onClick }
            aria-label={ ariaLabel }
            aria-haspopup='true'
        >
            <i className={ css('ms-Icon', 'ms-Icon--More') } />
        </button>
    );
}
