import * as React from 'react';
import {
    FocusZone
} from 'office-ui-fabric-react/lib/FocusZone';
import {
    List
} from 'office-ui-fabric-react/lib/List';
import {
    BaseComponent
} from 'office-ui-fabric-react/lib/Utilities';
import { ThemeListItem } from './ThemeListItem';
import { IThemeListProps } from './ThemeList.Props';
import { ITheme } from '../Theme';
export interface IThemeListState {
    selectedIndex?: number;
}

const ROWS_PER_PAGE = 3;
const MAX_ROW_HEIGHT = 120;

export class ThemeList extends BaseComponent<IThemeListProps, IThemeListState> {
    public currentTheme: ITheme;
    private _columnCount: number;
    private _columnWidth: number;
    private _rowHeight: number;
    private _themeList: ThemeList;

    public constructor(props) {
        super(props);
        this._getItemCountForPage = this._getItemCountForPage.bind(this);
        this._getPageHeight = this._getPageHeight.bind(this);
        this.state = { selectedIndex: -1 };
    }

    public render() {
        return (
            <FocusZone>
                <List
                    ref={ this._resolveRef('_themeList') }
                    className='sp-ThemeList-list'
                    items={ this.props.themes }
                    getItemCountForPage={ this._getItemCountForPage }
                    getPageHeight={ this._getPageHeight }
                    renderedWindowsAhead={ 4 }
                    onRenderCell={ this._onRenderTheme.bind(this) }
                    />
            </FocusZone>
        );
    }

    private _onRenderTheme(item: ITheme, index: number) {
        return <div
            className='sp-ThemeList-item'
            data-is-focusable={ true }
            key={ item.name + index + '' }
            style={ {
                width: (100 / this._columnCount) + '%',
                height: this._columnWidth + 'px'
            } }
            onClick={ (ev) => this._onThemeClick(ev, item, index) }>
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
            this._columnCount = Math.ceil(surfaceRect.width / MAX_ROW_HEIGHT);
            this._columnWidth = Math.floor(surfaceRect.width / this._columnCount);
            this._rowHeight = this._columnWidth;
        }

        return (this._columnCount ? this._columnCount : 1) * ROWS_PER_PAGE;
    }

    private _getPageHeight(itemIndex: number, surfaceRect) {
        return (this._rowHeight ? this._rowHeight : 150) * ROWS_PER_PAGE;
    }
}

export default ThemeList;