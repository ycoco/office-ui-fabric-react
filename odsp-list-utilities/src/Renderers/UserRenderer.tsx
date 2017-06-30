import * as React from 'react';
import { css } from 'office-ui-fabric-react/lib/Utilities';
import { BaseText } from './BaseText';

export interface IUserRendererUser {
    title: string;
    email: string;
    picture: string;
    sip: string;
    ariaLabel: string;
}

export interface IUserRendererProps {
    users: Array<IUserRendererUser>;
    isDisabled?: boolean;
    isAnonymous: boolean;
}

export function UserRenderer(props: IUserRendererProps): JSX.Element {
    'use strict';

    const { users, isAnonymous, isDisabled } = props;

    if (isAnonymous) {
        return (
            <div>
                { users.map((user: IUserRendererUser, index: number) => (
                    <div key={ index }>
                        <BaseText isDisabled={ isDisabled } text={ user.title } />
                    </div>
                )) }
            </div>
        );
    }

    return users.length ?
        <div>
            {
                users.map((user: IUserRendererUser, index: number) => (
                    <div key={ index }>
                        <span
                            className={ css('od-FieldRender', 'od-FieldRender-nofill', {
                                'od-FieldRenderer--disabled': isDisabled
                            }) }
                        >
                            { user.title }
                        </span>
                    </div>
                ))
            }
        </div> :
        (
            <BaseText isDisabled={ isDisabled } text='' />
        );
}
