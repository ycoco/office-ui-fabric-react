import * as React from 'react';
import {
    ISPListColumn,
    ISPListItem
} from '@ms/odsp-datasources/lib/dataSources/item/spListItemProcessor/ISPListItemData';

/**
 * All field renderers will be passed these properties. 
 * Specialized field renderers may extend this interface to include their own custom properties.
 */
export interface IFieldRendererProps {
    item: ISPListItem;
    index: number;
    column: ISPListColumn;
}

/**
 * This describes the interface of a "Field Renderer" for the details list
 * A Field Renderer is just a React SFC (Stateless Functional Component) with certain props
 */
export type IFieldRenderer<T extends IFieldRendererProps> = React.SFC<T>;