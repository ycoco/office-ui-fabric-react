/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { BaseText } from './BaseText';
import DriveSpaceHelper from '@ms/odsp-utilities/lib/string/DriveSpaceHelper';
import './FileSizeRenderer.scss';

export interface IFileSizeRendererProps {
    /** The file size in raw number of bytes */
    size: number;

    /** Whether the field is disabled. */
    isDisabled?: boolean;

    /** aria label of the field. */
    ariaLabel?: string;
}

export function FileSizeRenderer(props: IFileSizeRendererProps): JSX.Element {
    let { size, isDisabled, ariaLabel } = props;

    const sizeText = DriveSpaceHelper.getDisplayString(size, { ignoreZero: true });

    if (!ariaLabel) {
        ariaLabel = sizeText;
    }

    return (
        <BaseText
            text={ sizeText }
            isDisabled={ isDisabled }
        />
    );
}
