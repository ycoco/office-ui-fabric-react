import * as React from 'react';
import { IBaseProps } from 'office-ui-fabric-react';
import { BaseComponent } from 'office-ui-fabric-react/lib/Utilities';

import { ITheme } from '../Theme';
import { ChoiceCircle } from './ChoiceCircle/index';
import './ThemeListItem.scss';


const FALL_BACK_PRIMARY = 'darkblue';
const FALL_BACK_PRIMARY_TEXT = 'white';
const FALL_BACK_SECONDARY = 'white';
const FALL_BACK_SECONDARY_TEXT = 'black';

export interface IThemeListItemProps extends IBaseProps {
    themeOption: ITheme;
    themeExampleText: string;
    index: number;
    selected?: boolean;
}

export class ThemeListItem extends BaseComponent<IThemeListItemProps, {}> {
    public render() {
        const theme = this.props.themeOption.theme;
        const themeExampleText = this.props.themeExampleText;
        const selected = this.props.selected;
        const themeName = this.props.themeOption.name;
        return (
            <div className='sp-ThemeListItem-container'
                data-is-focusable={ true }
                aria-label={ themeName }
                role='listitem'>
                <div className='sp-ThemeListItem-themeContainer'
                    aria-hidden={ true }>
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
                            }>
                            { themeExampleText }
                        </div>
                    </div>
                </div>
                <div
                    className='sp-ThemeListItem-displayNameContainer'
                    aria-checked={ selected }
                    role='checkbox'>
                    <ChoiceCircle isChecked={ selected } />
                    <div className='sp-ThemeListItem-displayName'
                        role='presentation'>
                        { themeName }
                    </div>
                </div>
            </div>
        );
    }
}