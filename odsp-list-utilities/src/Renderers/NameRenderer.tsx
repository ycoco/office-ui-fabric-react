import * as React from 'react';

import { Link } from 'office-ui-fabric-react/lib/Link';
import { BaseText } from './BaseText';
import './NameRenderer.scss';

const CLASS_NAME = 'od-FieldRenderer-name';

export interface INameRendererProps {
    linkUrl: string;
    linkText: string;
    onClick: (ev: React.MouseEvent<HTMLElement>) => void;
    isDisabled?: boolean;
    ariaLabel?: string;
    disableTooltip?: boolean;
}

export function NameRenderer(props: INameRendererProps): JSX.Element {
    let { linkUrl, linkText, onClick, isDisabled, ariaLabel, disableTooltip } = props;
    ariaLabel = ariaLabel || linkText;

    return isDisabled ?
        (
            <BaseText className={ CLASS_NAME }
                isDisabled={ isDisabled }
                text={ linkText }
                ariaLabel={ ariaLabel }
            />
        ) : (
            <Link className={ CLASS_NAME }
                href={ linkUrl }
                onDragStart={ preventDefault }
                onClick={ onClick }
                title={ disableTooltip ? undefined : linkText }>
                { linkText }
            </Link>
        );
}

function preventDefault(event: React.DragEvent<Link>) {
    event.preventDefault();
}
