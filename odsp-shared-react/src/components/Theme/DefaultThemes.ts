import { ITheme } from './Theme';

export function getDefaultThemes() {
    return DefaultThemesList;
}
// Currently these are hardcoded themes. This will be replaced by a rest call.
const DefaultThemesList: { [key: string]: ITheme } = {
    default_Office: {
        name: '',
        backgroundImageUri: '',
        theme: {
            themePrimary: '#0078d7',
            themeLighterAlt: '#eff6fc',
            themeLighter: '#deecf9',
            themeLight: '#c7e0f4',
            themeTertiary: '#71afe5',
            themeSecondary: '#2b88d8',
            themeDarkAlt: '#106ebe',
            themeDark: '#005a9e',
            themeDarker: '#004578',
            neutralLighterAlt: '#f8f8f8',
            neutralLighter: '#f4f4f4',
            neutralLight: '#eaeaea',
            neutralQuaternaryAlt: '#dadada',
            neutralQuaternary: '#d0d0d0',
            neutralTertiaryAlt: '#c8c8c8',
            neutralTertiary: '#a6a6a6',
            neutralSecondaryAlt: '#767676',
            neutralSecondary: '#666666',
            neutralPrimary: '#333',
            neutralPrimaryAlt: '#3c3c3c',
            neutralDark: '#212121',
            black: '#000000',
            white: '#fff',
            primaryBackground: '#fff',
            primaryText: '#333'
        }
    },
    default_Orange: {
        name: '',
        backgroundImageUri: '',
        theme: {
            themePrimary: '#ca5010',
            themeLighterAlt: '#fef6f1',
            themeLighter: '#fdede4',
            themeLight: '#fbdac9',
            themeTertiary: '#f6b28d',
            themeSecondary: '#e55c12',
            themeDarkAlt: '#b5490f',
            themeDark: '#8d390b',
            themeDarker: '#6f2d09',
            neutralLighterAlt: '#f8f8f8',
            neutralLighter: '#f4f4f4',
            neutralLight: '#eaeaea',
            neutralQuaternaryAlt: '#dadada',
            neutralQuaternary: '#d0d0d0',
            neutralTertiaryAlt: '#c8c8c8',
            neutralTertiary: '#a6a6a6',
            neutralSecondaryAlt: '#767676',
            neutralSecondary: '#666666',
            neutralPrimary: '#333',
            neutralPrimaryAlt: '#3c3c3c',
            neutralDark: '#212121',
            black: '#000000',
            white: '#fff',
            primaryBackground: '#fff',
            primaryText: '#333'
        }
    },
    default_Red: {
        name: '',
        backgroundImageUri: '',
        theme: {
            themePrimary: '#d13438',
            themeLighterAlt: '#fdf5f5',
            themeLighter: '#faebeb',
            themeLight: '#f6d6d8',
            themeTertiary: '#ecaaac',
            themeSecondary: '#d6494d',
            themeDarkAlt: '#c02b30',
            themeDark: '#952226',
            themeDarker: '#751b1e',
            neutralLighterAlt: '#f8f8f8',
            neutralLighter: '#f4f4f4',
            neutralLight: '#eaeaea',
            neutralQuaternaryAlt: '#dadada',
            neutralQuaternary: '#d0d0d0',
            neutralTertiaryAlt: '#c8c8c8',
            neutralTertiary: '#a6a6a6',
            neutralSecondaryAlt: '#767676',
            neutralSecondary: '#666666',
            neutralPrimary: '#333',
            neutralPrimaryAlt: '#3c3c3c',
            neutralDark: '#212121',
            black: '#000000',
            white: '#fff',
            primaryBackground: '#fff',
            primaryText: '#333'
        }
    },
    default_Purple: {
        name: '',
        backgroundImageUri: '',
        theme: {
            themePrimary: '#6b69d6',
            themeLighterAlt: '#f8f7fd',
            themeLighter: '#f0f0fb',
            themeLight: '#e1e1f7',
            themeTertiary: '#c1c0ee',
            themeSecondary: '#7a78da',
            themeDarkAlt: '#5250cf',
            themeDark: '#3230b0',
            themeDarker: '#27268a',
            neutralLighterAlt: '#f8f8f8',
            neutralLighter: '#f4f4f4',
            neutralLight: '#eaeaea',
            neutralQuaternaryAlt: '#dadada',
            neutralQuaternary: '#d0d0d0',
            neutralTertiaryAlt: '#c8c8c8',
            neutralTertiary: '#a6a6a6',
            neutralSecondaryAlt: '#767676',
            neutralSecondary: '#666666',
            neutralPrimary: '#333',
            neutralPrimaryAlt: '#3c3c3c',
            neutralDark: '#212121',
            black: '#000000',
            white: '#fff',
            primaryBackground: '#fff',
            primaryText: '#333'
        }
    },
    default_Green: {
        name: '',
        backgroundImageUri: '',
        theme: {
            themePrimary: '#10893e',
            themeLighterAlt: '#effdf4',
            themeLighter: '#dffbea',
            themeLight: '#bff7d5',
            themeTertiary: '#7aefa7',
            themeSecondary: '#14a94e',
            themeDarkAlt: '#0f7c39',
            themeDark: '#0c602c',
            themeDarker: '#094c23',
            neutralLighterAlt: '#f8f8f8',
            neutralLighter: '#f4f4f4',
            neutralLight: '#eaeaea',
            neutralQuaternaryAlt: '#dadada',
            neutralQuaternary: '#d0d0d0',
            neutralTertiaryAlt: '#c8c8c8',
            neutralTertiary: '#a6a6a6',
            neutralSecondaryAlt: '#767676',
            neutralSecondary: '#666666',
            neutralPrimary: '#333',
            neutralPrimaryAlt: '#3c3c3c',
            neutralDark: '#212121',
            black: '#000000',
            white: '#fff',
            primaryBackground: '#fff',
            primaryText: '#333'
        }
    },
    default_Gray: {
        name: '',
        backgroundImageUri: '',
        theme: {
            themePrimary: '#5d5a58',
            themeLighterAlt: '#f7f7f7',
            themeLighter: '#efeeee',
            themeLight: '#dfdedd',
            themeTertiary: '#bbb9b8',
            themeSecondary: '#6d6a67',
            themeDarkAlt: '#53504e',
            themeDark: '#403e3d',
            themeDarker: '#323130',
            neutralLighterAlt: '#f8f8f8',
            neutralLighter: '#f4f4f4',
            neutralLight: '#eaeaea',
            neutralQuaternaryAlt: '#dadada',
            neutralQuaternary: '#d0d0d0',
            neutralTertiaryAlt: '#c8c8c8',
            neutralTertiary: '#a6a6a6',
            neutralSecondaryAlt: '#767676',
            neutralSecondary: '#666666',
            neutralPrimary: '#333',
            neutralPrimaryAlt: '#3c3c3c',
            neutralDark: '#212121',
            black: '#000000',
            white: '#fff',
            primaryBackground: '#fff',
            primaryText: '#333'
        }
    }
    // Dark themes are temporarily disabled until several bugs are fixed with icons.
    // default_DarkYellow: {
    //     name: '',
    //     backgroundImageUri: '',
    //     isInverted: true,
    //     theme: {
    //         themePrimary: "#fce100",
    //         themeLighterAlt: "#0d0b00",
    //         themeLighter: "#191700",
    //         themeLight: "#322d00",
    //         themeTertiary: "#6a5f00",
    //         themeSecondary: "#e3cc00",
    //         themeDarkAlt: "#ffe817",
    //         themeDark: "#ffed4b",
    //         themeDarker: "#fff171",
    //         neutralLighterAlt: "#282828",
    //         neutralLighter: "#313131",
    //         neutralLight: "#3f3f3f",
    //         neutralQuaternaryAlt: "#484848",
    //         neutralQuaternary: "#4f4f4f",
    //         neutralTertiaryAlt: "#6d6d6d",
    //         neutralTertiary: "#c8c8c8",
    //         neutralSecondaryAlt: "#d0d0d0",
    //         neutralSecondary: "#dadada",
    //         neutralPrimaryAlt: "#eaeaea",
    //         neutralPrimary: "#ffffff",
    //         // neutralPrimaryAlt
    //         neutralDark: "#f4f4f4",
    //         black: "#f8f8f8",
    //         white: "#1f1f1f",
    //         primaryBackground: "#1f1f1f",
    //         primaryText: "#ffffff",
    //         error: "#ff5f5f"
    //     }
    // },
    // default_DarkBlue: {
    //     name: '',
    //     isInverted: true,
    //     backgroundImageUri: '',
    //     theme: {
    //         themePrimary: "#00bcf2",
    //         themeLighterAlt: "#00090c",
    //         themeLighter: "#001318",
    //         themeLight: "#002630",
    //         themeTertiary: "#005066",
    //         themeSecondary: "#00abda",
    //         themeDarkAlt: "#0ecbff",
    //         themeDark: "#44d6ff",
    //         themeDarker: "#6cdfff",
    //         neutralLighterAlt: "#2e3340",
    //         neutralLighter: "#353a49",
    //         neutralLight: "#404759",
    //         neutralQuaternaryAlt: "#474e62",
    //         neutralQuaternary: "#4c546a",
    //         neutralTertiaryAlt: "#646e8a",
    //         neutralTertiary: "#c8c8c8",
    //         neutralSecondaryAlt: "#d0d0d0",
    //         neutralSecondary: "#dadada",
    //         neutralPrimaryAlt: "#eaeaea",
    //         neutralPrimary: "#ffffff",
    //         // neutralPrimaryAlt
    //         neutralDark: "#f4f4f4",
    //         black: "#f8f8f8",
    //         white: "#262a35",
    //         primaryBackground: "#262a35",
    //         primaryText: "#ffffff",
    //         error: "#ff5f5f"
    //     }
    // }
}