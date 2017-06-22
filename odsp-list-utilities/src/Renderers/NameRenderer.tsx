import * as React from 'react';

import { Link } from 'office-ui-fabric-react/lib/Link';
import './NameRenderer.scss';

export interface INameRendererProps {
    linkUrl: string;
    linkText: string;
    onClick: (ev: React.MouseEvent<HTMLElement>) => void;
    isDisabled?: boolean;
    ariaLabel?: string;
}

export function NameRenderer(props: INameRendererProps): JSX.Element {
    let { linkUrl, linkText, onClick, isDisabled, ariaLabel } = props;
    ariaLabel = ariaLabel || linkText;    // Default to linkText if not specified

    let linkClass = 'od-FieldRenderer-name';
    // apply special styling if item is disabled
    // link does nothing if item is disabled
    if (isDisabled) {
        linkClass += ' od-FieldRenderer--disabled';
        linkUrl = 'javascript:;';
    }

    return (
        <Link className={ linkClass } href={ linkUrl } onClick={ onClick } title={ linkText }>
            { linkText }
        </Link>
    );
}
