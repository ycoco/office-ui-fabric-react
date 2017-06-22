// OneDrive:IgnoreCodeCoverage

import * as React from 'react';

import { BaseText } from './BaseText';
import { Link } from 'office-ui-fabric-react/lib/Link';
import './TitleRenderer.scss';

export interface ITitleRendererProps {
    text: string;
    hasTitle: boolean;
    isLinkTitle: boolean;
    onClick: (evt: React.MouseEvent<HTMLElement>) => void;
    isDisabled?: boolean;
    ariaLabel?: string;
}

export function TitleRenderer(props: ITitleRendererProps): JSX.Element {
    'use strict';

    let { text, hasTitle, isLinkTitle, onClick, isDisabled, ariaLabel } = props;
    ariaLabel = ariaLabel || text;    // Default to text if no ariaLabel given

    let renderLinkTitle = true;
    if (hasTitle && !isLinkTitle) {
        renderLinkTitle = false;
    }

    if (renderLinkTitle) {
        if (hasTitle) {
            return (
                <div
                    className='od-FieldRender-title od-FieldRender-display--link'
                    data-is-focusable='true'
                    role='button'
                    aria-label={ ariaLabel }
                    onClick={ onClick }
                    title={ text }
                    dangerouslySetInnerHTML={ { __html: text } }></div>
            );
        } else {
            return (
                <Link
                    className='od-FieldRender-title od-FieldRender-display--link'
                    aria-label={ ariaLabel }
                    onClick={ onClick }
                    title={ text }>
                    { text }
                </Link>
            );
        }
    } else {
        // we're rendering title field here.
        return (
            <BaseText text={ text } isDisabled={ isDisabled } ariaLabel={ ariaLabel } />
        );
    }
}
