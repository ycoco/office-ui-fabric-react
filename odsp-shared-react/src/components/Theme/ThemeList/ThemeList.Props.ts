import * as React from 'react';
import { IBaseProps } from 'office-ui-fabric-react';

import { ITheme } from '../Theme';

export interface IThemeListProps extends IBaseProps {
    /**
     * The array of themes that the list will display
     */
    themes?: ITheme[];
    /**
     * A callback that will be called whenever a theme is clicked.
     */
    onThemeClick?: (ev?: React.MouseEvent<any>, theme?: ITheme) => void;
    /**
     * The text that should be shown to demonstrate what the text color will be on various backgrounds.
     */
    themeSampleText?: string;

    /** The css Class of the ThemeList */
    className?: string;

    ariaLabel?: string;
}