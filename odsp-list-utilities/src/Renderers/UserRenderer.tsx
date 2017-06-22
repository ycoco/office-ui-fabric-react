import * as React from 'react';

import { BaseText } from './BaseText';

export interface IUserRendererUser {
    title: string;
    email: string;
    picture: string;
    sip: string;
    ariaLabel: string;
}

export interface IUserRendererProps {
    users: Array<IUserRendererUser>
    isAnonymous: boolean;
}

export function UserRenderer(props: IUserRendererProps): JSX.Element {
    'use strict';

    let { users, isAnonymous } = props;
    let userClassNames: string = 'od-FieldRender od-FieldRender-nofill';

    if (isAnonymous) {
        return (
            <div>
                { users.map((user: IUserRendererUser, index: number) => (
                    <div key={ index }>
                        <BaseText text={ user.title } />
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
                            className={ userClassNames }
                        >
                            { user.title }
                        </span>
                    </div>
                ))
            }
        </div> :
        (
            <BaseText text='' />
        );
}
