// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { Persona, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
import { ComposedCheckbox, IComposedCheckboxProps } from './ComposedCheckbox';

const DEFAULT_IMAGE_URL = "/_layouts/15/userphoto.aspx?size=S&accountname=";

export interface IPersonaCheckboxProps extends IComposedCheckboxProps {
    /**
     * Url to the image to use, should be a square aspect ratio and big enough to fit in the image area.
     */
    imageUrl?: string;
}

/**
 * Persona Checkbox control that is used to select/deselect a person option
 */
export class PersonaCheckbox extends React.Component<IPersonaCheckboxProps, {}> {
    public render() {
        let { label, imageUrl } = this.props;
        // TODO: need to modify checkbox and persona controls in fabric react to make sure they can be associated with each other.
        return (
            <ComposedCheckbox className='PersonaCheckbox' showLabel={ false } { ...this.props }>
                <Persona primaryText={ label } imageUrl={ imageUrl || DEFAULT_IMAGE_URL } size={ PersonaSize.extraSmall } />
            </ComposedCheckbox>
        );
    }
}
