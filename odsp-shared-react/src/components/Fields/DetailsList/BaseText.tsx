// OneDrive:IgnoreCodeCoverage

/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { ISPListColumn, ISPListItem } from '@ms/odsp-datasources/lib/dataSources/item/spListItemProcessor/ISPListItemData';
import { format } from '@ms/odsp-utilities/lib/string/StringHelper';

// import '../ReactDetailsList.css';

export interface IBaseTextProps extends React.HTMLProps<HTMLDivElement> {
  column: ISPListColumn;
  text?: string;
  item?: ISPListItem;
  noTextRender?: boolean;
  strings: {
    emptyValueAriaLabel: string;
    cellAriaLabel: string;
  };
}

export const BaseText = (props: IBaseTextProps) => {
    let { text, item, column, children, noTextRender, strings } = props;
    let ariaLabel = getAriaLabel(column, text, strings.emptyValueAriaLabel, strings.cellAriaLabel);

    if (text === undefined) {
        text = getCellText(item, column);
    }

    // apply special styling if item is disabled
    let baseTextClass = '';
    if (item && item.properties.isDisabled) {
        baseTextClass = 'od-FieldRenderer--disabled';
    }

    return (
        <div data-is-focusable={ true } aria-label={ ariaLabel } className={ baseTextClass }>
          { noTextRender ? null : (text || ' ') }
          { children }
        </div>
    );
};

export function getAriaLabel(column: ISPListColumn, text: string, emptyValueAriaLabel: string, cellAriaLabel: string) {
    'use strict';

    if (!text || (column.internalName && column.internalName.toLowerCase() === 'attachments' && text === '0')) {
        text = emptyValueAriaLabel;
    }
    return format(cellAriaLabel, column.name, text);
}

export function getCellText(item: ISPListItem, column: ISPListColumn): string {
    'use strict';

    let text = '';

    if (item) {
      text = item[column.key];

      if (text === undefined && item.properties) {
        text = item.properties[column.key];

        if (text === undefined) {
            text = item.recycleBinProperties[column.key];
        }

        if (text && Array.isArray(text)) {
          text = (text as any).join(', ');
        }
      }
    }

    return text;
}
