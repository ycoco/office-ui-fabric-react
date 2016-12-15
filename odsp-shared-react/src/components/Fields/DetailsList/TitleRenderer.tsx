// OneDrive:IgnoreCodeCoverage

/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { IFieldRenderer, IFieldRendererProps } from './IFieldRenderer';
import { BaseText, getCellText, getAriaLabel } from './BaseText';
import { ISPListContext } from '@ms/odsp-datasources/lib/dataSources/item/spListItemRetriever/interfaces/ISPListContext';
import ItemType from '@ms/odsp-utilities/lib/icons/ItemType';
import { Link } from 'office-ui-fabric-react/lib/Link';
import './TitleRenderer.scss';

export interface ITitleRendererProps extends IFieldRendererProps {
    listContext: ISPListContext;
    onFileClick: (evt: React.MouseEvent<HTMLElement>) => void;
    onFolderClick: (evt: React.MouseEvent<HTMLElement>) => void;
    strings: {
        emptyValueAriaLabel: string;
        cellAriaLabel: string;
    };
}

export function TitleRenderer(props: ITitleRendererProps) {
    'use strict';

    let { item, column, listContext, onFileClick, onFolderClick, strings } = props;

    let renderLinkTitle = true;
    let hasTitle = listContext.rawListSchema && listContext.rawListSchema.Field && Boolean(listContext.rawListSchema.HasTitle);
    let isLinkTitle = (column.internalName === 'LinkTitle' || column.internalName === 'LinkTitleNoMenu');
    let text = getCellText(item, column);

    if (hasTitle && !isLinkTitle) {
        renderLinkTitle = false;
    }

    let onClick: (evt: React.MouseEvent<HTMLElement>) => void;
    if (item.type === ItemType.Folder || item.properties.FSObjType === '1') {
        onClick = onFolderClick;
    } else {
        onClick = onFileClick;
    }

    if (renderLinkTitle) {
        if (hasTitle) {
            return (
                <div
                    className='od-FieldRender-title od-FieldRender-display--link'
                    data-is-focusable='true'
                    role='button'
                    aria-label={ getAriaLabel(column, text, strings.emptyValueAriaLabel, strings.cellAriaLabel) }
                    onClick={ onClick }
                    title={ text }
                    dangerouslySetInnerHTML={ { __html: text } }></div>
            );
        } else {
            return (
                <Link
                    className='od-FieldRender-title od-FieldRender-display--link'
                    aria-label={ getAriaLabel(column, text, strings.emptyValueAriaLabel, strings.cellAriaLabel) }
                    onClick={ onClick }
                    title={ text }>
                    { text }
                </Link>
                );
        }
    } else {
        // we're rendering title field here.
        return (
            <BaseText column={ column } text={ text } strings={ strings }/>
        );
    }
}

// Typecheck to make sure this renderer conforms to IFieldRenderer.
// If this renderer does not, then the next line will fail to compile.
/* tslint:disable-next-line:no-unused-variable */
const typecheck: IFieldRenderer<ITitleRendererProps> = TitleRenderer;
