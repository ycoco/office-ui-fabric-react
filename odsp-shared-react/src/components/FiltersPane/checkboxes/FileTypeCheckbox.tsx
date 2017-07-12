// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { Image } from 'office-ui-fabric-react/lib/Image';
import { ComposedCheckbox, IComposedCheckboxProps } from './ComposedCheckbox';
import './FileTypeCheckbox.scss';

export interface IFileTypeCheckboxProps extends IComposedCheckboxProps {
    imageUrl?: string;
}

/**
 * File Type Checkbox control that is used to render file type option.
 */
export class FileTypeCheckbox extends React.Component<IFileTypeCheckboxProps, {}> {
    public render() {
        let { imageUrl, label } = this.props;
        // TODO: need to modify checkbox and persona controls in fabric react to make sure they can be associated with each other.
        return (
            <ComposedCheckbox className='FileTypeCheckbox' showLabel={ false } { ...this.props } >
                <Image src={ imageUrl } width='16px'/><span className='FileTypeCheckbox-label'>{ label }</span>
            </ComposedCheckbox>
        );
    }
}
