/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { IFieldRenderer, IFieldRendererProps } from './IFieldRenderer';
import { BaseText, getCellText, getAriaLabel } from './BaseText';
// import '../ReactDetailsList.css';

export interface ITextRendererProps extends IFieldRendererProps {
    strings: {
        emptyValueAriaLabel: string;
        cellAriaLabel: string;
    };
}

export function TextRenderer(props: ITextRendererProps) {
    'use strict';

    let { item, column, strings } = props;

    // The server will process some fields to turn urls into hyperlinks. It will also ensure that the content is safe to inject directly.
    // In this case, the column will be marked with the isAutoHyperLink flag.
    let isSafeToInnerHTML = column.isAutoHyperLink;
    let text = getCellText(item, column);

    // apply special styling if item is disabled
    let textClass = 'od-FieldRenderer-text';
    if (item && item.properties.isDisabled) {
        textClass += ' od-FieldRenderer--disabled';
    }

    return  (
        (isSafeToInnerHTML) ?
        <div className={ textClass } data-is-focusable={ true } aria-label={ getAriaLabel(column, text, strings.emptyValueAriaLabel, strings.cellAriaLabel) } title={ text } dangerouslySetInnerHTML={ { __html: text } } />
        :
        <BaseText text={ text } column={ column } item={ item } strings={ strings } />
    );
}

// Typecheck to make sure this renderer conforms to IFieldRenderer.
// If this renderer does not, then the next line will fail to compile.
/* tslint:disable-next-line:no-unused-variable */
const typecheck: IFieldRenderer<ITextRendererProps> = TextRenderer;
