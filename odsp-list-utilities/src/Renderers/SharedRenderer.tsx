/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

export interface ISharedRendererProps {
    fieldValue: string;
} 

export function SharedRenderer(props: ISharedRendererProps) {
    'use strict';

    let fieldValue = props && props.fieldValue || '';

    return (
        <div
            data-is-focusable={ true }>
            { fieldValue ? (
            <i className='od-SharedField--shared ms-Icon ms-Icon--People' />
            ) : null }
            { fieldValue }
        </div>
    );
}
