import * as React from 'react';
import { ITheme } from '../Theme';
import { CheckCircle } from '../../CheckCircle/index';
import { css, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';
import './ThemeListItem.scss';


const FALL_BACK_PRIMARY = 'darkblue';
const FALL_BACK_PRIMARY_TEXT = 'white';
const FALL_BACK_SECONDARY = 'white';
const FALL_BACK_SECONDARY_TEXT = 'black';

export interface IThemeListItemProps {
    themeOption: ITheme;
    themeExampleText: string;
    index: number;
    selected?: boolean;
}

export class ThemeListItem extends BaseComponent<IThemeListItemProps, {}> {
    public render() {
        let theme = this.props.themeOption.theme;
        let themeExampleText = this.props.themeExampleText;
        let selected = this.props.selected;
        return (
            <div className='sp-ThemeListItem-container'>
                <div
                    className={ css('sp-ThemeListItem-checkCircle', selected ? 'selected' : null) }>
                    <CheckCircle isChecked={ selected } />
                </div>
                <div className='sp-ThemeListItem-colorContainer'>
                    <div className='sp-ThemeListItem-colorSwatch'
                        style={ { backgroundColor: theme.themePrimary || FALL_BACK_PRIMARY } } />
                    <div className='sp-ThemeListItem-colorSwatch'
                        style={ { backgroundColor: theme.themeTertiary || FALL_BACK_PRIMARY_TEXT } } />
                    <div className='sp-ThemeListItem-colorSwatch'
                        style={ { backgroundColor: theme.themeLight } } />
                    <div className='sp-ThemeListItem-colorSwatch'
                        style={ { backgroundColor: theme.themeLighter } } />
                </div>
                <div className='sp-ThemeListItem-textContainer'
                    style={
                        {
                            backgroundColor: theme.white || FALL_BACK_SECONDARY
                        }
                    }>
                    <div className='sp-ThemeListItem-text'
                        style={
                            {
                                color: theme.primaryText || FALL_BACK_SECONDARY_TEXT
                            }
                        }
                        role='presentation'>
                        { themeExampleText }
                    </div>
                </div>
            </div >
        );
    }
}