import * as React from 'react';
import {
    FocusZone
} from 'office-ui-fabric-react/lib/FocusZone';
import {
    List
} from 'office-ui-fabric-react/lib/List';
import {
    BaseComponent,
    css
} from 'office-ui-fabric-react/lib/Utilities';
import { ThemeListItem } from './ThemeListItem';
import { IThemeListProps } from './ThemeList.Props';
import { ITheme } from '../Theme';

import './ThemeList.scss';
export interface IThemeListState {
    selectedIndex?: number;
}

const ROWS_PER_PAGE = 3;
const COLUMN_COUNT = 2;

export class ThemeList extends BaseComponent<IThemeListProps, IThemeListState> {
    public currentTheme: ITheme;
    private _columnCount: number;
    private _themeList: ThemeList;

    public constructor(props) {
        super(props);
        this._getItemCountForPage = this._getItemCountForPage.bind(this);
        this.state = { selectedIndex: -1 };
    }

    public render() {
        return (
            <FocusZone>
                <List
                    ref={ this._resolveRef('_themeList') }
                    className={ css('sp-ThemeList-list', this.props.className) }
                    items={ this.props.themes }
                    getItemCountForPage={ this._getItemCountForPage }
                    renderedWindowsAhead={ 4 }
                    onRenderCell={ this._onRenderTheme.bind(this) }
                    />
            </FocusZone>
        );
    }

    private _onRenderTheme(item: ITheme, index: number) {
        let isEndItem = ((index + 1) % COLUMN_COUNT) === 0 && index !== 0;
        let isStartItem = (index % (COLUMN_COUNT)) === 0;
        return <div
            className={ css('sp-ThemeList-item',
                isStartItem && 'sp-ThemeList-startItem',
                isEndItem && 'sp-ThemeList-endItem') }
            data-is-focusable={ true }
            key={ item.name + index + '' }
            style={ {
                width: (100 / COLUMN_COUNT) + '%',
            } }
            onClick={ (ev) => this._onThemeClick(ev, item, index) }
            title={ item.name }
            aria-label={ item.name }
            >
            <ThemeListItem
                themeOption={ item }
                index={ index }
                themeExampleText={ this.props.themeSampleText }
                selected={ index === this.state.selectedIndex }
                />
        </div>
    }

    private _onThemeClick(ev: React.MouseEvent<any>, item: ITheme, index?: number) {
        if (this.props.onThemeClick) {
            this.props.onThemeClick(ev, item);
        }
        this.setState({
            selectedIndex: index
        }, () => this._themeList.forceUpdate());
    }

    private _getItemCountForPage(itemIndex: number, surfaceRect) {
        if (itemIndex === 0) {
            this._columnCount = Math.ceil(surfaceRect.width / COLUMN_COUNT);
        }

        return (this._columnCount ? this._columnCount : 1) * ROWS_PER_PAGE;
    }
}

export default ThemeList;