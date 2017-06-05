/** Contains utility text functions for list context menu */
import * as React from 'react';
import {
  IContextualMenuProps,
  IContextualMenuItem,
  DirectionalHint
} from 'office-ui-fabric-react';
import { ISPListColumn } from '@ms/odsp-datasources/lib/SPListItemProcessor';
import { IActionDependencies } from '../Actions/IAction';
import { getSortMenuStrings } from './ColumnUtilities';

namespace ColumnMenuHelper {
    export function getMenuProps(
        targetElement: HTMLElement,
        ev: React.MouseEvent<HTMLElement>,
        column: ISPListColumn,
        dependencies: IActionDependencies): IContextualMenuProps {

        const items: IContextualMenuItem[] = [];
        if (column.sortable) {
            items.push(..._getSortCommands(ev, column, dependencies));
        }
        items.push({ key: 'sortDivider', name: '-' });

        if (column.filterable) {
            items.push(..._getFilterCommands(ev, column, dependencies));
        }
        items.push({ key: 'filterDivider', name: '-' });

        if (column.groupable) {
            items.push(..._getGroupCommands(ev, column, dependencies));
        }

        return {
            items: items,
            targetElement: targetElement,
            directionalHint: DirectionalHint.bottomLeftEdge,
            gapSpace: 0,
            isBeakVisible: true
        };
    }

    function _getSortCommands(
        ev: React.MouseEvent<HTMLElement>,
        column: ISPListColumn,
        dependencies: IActionDependencies): IContextualMenuItem[] {

        let actionMap = dependencies.actionMap;
        let isChecked: boolean = column.isSorted && column.isAscending;
        const {
            ascendingString,
            descendingString
        } = getSortMenuStrings(column, dependencies.strings);

        const sortAscending: IContextualMenuItem = {
            key: 'asc',
            name: ascendingString,
            canCheck: isChecked,
            checked: isChecked,
            data: {
                action: new actionMap.sortAction({
                    column: column,
                    ascending: true
                    }, dependencies)
            },
            onClick: onCommandClick
        };

        isChecked = column.isSorted && !column.isAscending;
        const sortDescending: IContextualMenuItem = {
            key: 'desc',
            name: descendingString,
            canCheck: isChecked,
            checked: isChecked,
            data: {
                action: new actionMap.sortAction({
                    column: column,
                    ascending: false
                    }, dependencies)
            },
            onClick: onCommandClick
        };

        return [
            sortAscending,
            sortDescending
        ];
    }

    function _getFilterCommands(
        ev: React.MouseEvent<HTMLElement>,
        column: ISPListColumn,
        dependencies: IActionDependencies): IContextualMenuItem[] {

        let isChecked: boolean = column.isFiltered;
        const filterBy: IContextualMenuItem = {
            key: 'filter',
            name: dependencies.strings.columnMenuFilter,
            canCheck: isChecked,
            checked: isChecked,
            data: {
                action: new dependencies.actionMap.launchFilterPanelAction({
                    column: column
                }, dependencies)
            },
            onClick: onCommandClick
        };

        return [
            filterBy
        ];
    }

    function _getGroupCommands(
        ev: React.MouseEvent<HTMLElement>,
        column: ISPListColumn,
        dependencies: IActionDependencies): IContextualMenuItem[] {

        let isChecked: boolean = column.isGrouped;
        const groupBy: IContextualMenuItem = {
            key: 'groupBy',
            name: 'Group By ' + column.name,
            canCheck: isChecked,
            checked: isChecked,
            data: {
                action: new dependencies.actionMap.groupAction({
                    column: column
                }, dependencies)
            },
            onClick: onCommandClick
        };

        return [
            groupBy
        ];
    }

    export function onCommandClick(ev?: React.MouseEvent<HTMLElement>, menuItem?: IContextualMenuItem): void {
        if (menuItem && menuItem.data && menuItem.data.action) {
            const action: { execute: (ev: React.MouseEvent<HTMLElement>) => void } = menuItem.data.action;
            action.execute(ev);
        }
    }
}

export default ColumnMenuHelper;