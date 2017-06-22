import * as React from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';
import './UrlRenderer.scss';

export interface IUrlRendererProps {
    url: string;
    urlDisplay: string;
    ariaLabel?: string;
}

export function UrlRenderer(props: IUrlRendererProps): JSX.Element {
    'use strict';

    let { url, urlDisplay, ariaLabel } = props;

    if (!Boolean(urlDisplay)) {
        urlDisplay = url;
    }

    return (
        <Link
            className='od-FieldRender-display od-FieldRender-display--link'
            href={ url }
            title={ urlDisplay }
            target='_blank'>
            { urlDisplay }
        </Link>
    );
}
