import * as React from 'react';
import { css } from 'office-ui-fabric-react/lib/Utilities';

export interface ISharedRendererProps {
    fieldValue: string;
}

export function SharedRenderer(props: ISharedRendererProps): JSX.Element {
    const fieldValue = props && props.fieldValue || '';

    return (
        <div
            data-is-focusable={ true }>
            { fieldValue ? (
                <i className={ css('od-SharedField--shared', 'ms-Icon', 'ms-Icon--People') } />
            ) : null }
            { fieldValue }
        </div>
    );
}
