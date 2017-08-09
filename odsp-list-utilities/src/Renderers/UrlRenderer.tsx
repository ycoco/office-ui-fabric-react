import * as React from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';
import './UrlRenderer.scss';

export interface IUrlRendererProps {
    url: string;
    urlDisplay: string;
    ariaLabel?: string;
    isImageUrl?: boolean;
}

export function UrlRenderer(props: IUrlRendererProps): JSX.Element {
    let { url, urlDisplay, ariaLabel, isImageUrl } = props;

    if (!urlDisplay) {
        urlDisplay = url;
    }

    let onClick = (evt: React.MouseEvent<HTMLElement>) => {
        if (Boolean(evt) && Boolean(evt.target)) {
            if (Boolean(url)) {
                window.open(url, '_blank');
            }
        }
    };

    return (
        isImageUrl ?
            <div className='od-FieldRender-image' data-is-focusable='true' onClick={ onClick }>
                <img src={ url } title={ urlDisplay } className='od-FieldRender-imageDisplay' />
            </div>
            :
            <Link
                className='od-FieldRender-display od-FieldRender-display--link'
                href={ url }
                onDragStart={ preventDefault }
                title={ urlDisplay }
                target='_blank'>
                { urlDisplay }
            </Link>
    );
}

function preventDefault(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
}
