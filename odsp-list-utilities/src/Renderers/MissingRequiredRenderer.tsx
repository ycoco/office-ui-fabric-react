/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { BaseText } from './BaseText';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import './MissingRequiredRenderer.scss';

export interface IMissingRequiredRendererProps {
    /** Text to display when an item is missing a required field */
    missingRequiredText: string;
    /** On click function for the cell */
    onClick?: (ev: React.MouseEvent<HTMLElement>) => void;
}

export function MissingRequiredRenderer(props: IMissingRequiredRendererProps): JSX.Element {
    return (
        <div className='od-FieldRenderer-missingRequired' onClick={ props.onClick } data-is-focusable='true'>
            <div className='od-FieldRenderer-missingRequiredIcon'>
                <Icon iconName='Error' />
            </div>
            <div className='od-FieldRenderer-missingRequiredText'>
                <BaseText text={ props.missingRequiredText } />
            </div>
        </div>
    );
}
