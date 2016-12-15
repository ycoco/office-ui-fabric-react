/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { IFieldRenderer, IFieldRendererProps } from './IFieldRenderer';

import { Link } from 'office-ui-fabric-react/lib/Link';
import './NameRenderer.scss';
// import '../ReactDetailsList.css';
import { getAriaLabel } from './BaseText';

export interface INameRendererProps extends IFieldRendererProps {
    linkUrl: string;
    onClick: (ev: React.MouseEvent<HTMLElement>) => void;
    strings: {
        emptyValueAriaLabel: string;
        cellAriaLabel: string;
    };
}

export function NameRenderer(props: INameRendererProps) {
    let { item, column, linkUrl, onClick, strings } = props;

    let linkClass = 'od-FieldRenderer-name';
    // apply special styling if item is disabled
    // link does nothing if item is disabled
    if (item && item.properties.isDisabled) {
        linkClass += ' od-FieldRenderer--disabled';
        linkUrl = 'javascript:;';
    }

    let linkText = (item ? item[column.key] : null) || '';

    return (
        <Link className={ linkClass } href={ linkUrl } onClick={ onClick } aria-label={ getAriaLabel(column, linkText, strings.emptyValueAriaLabel, strings.cellAriaLabel) } title={ linkText }>
            { linkText }
        </Link>
    );
}

// Typecheck to make sure this renderer conforms to IFieldRenderer.
// If this renderer does not, then the next line will fail to compile.
/* tslint:disable-next-line:no-unused-variable */
const typecheck: IFieldRenderer<INameRendererProps> = NameRenderer;
