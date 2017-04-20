import * as React from 'react';
import { ChangeTheLookPanel, IChangeTheLookPanelProps, ChangeTheLookPanelStrings, ITheme } from '../../../../components/index';
import { Button } from 'office-ui-fabric-react/lib/Button';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

export interface IChangeTheLookPanelExampleState {
  showPanel: boolean;
}

const themes: ITheme[] = [
  {
    name: 'Office',
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
        neutralDark: '#212121',
        black: '#000000',
        white: '#fff',
        primaryBackground: '#fff',
        primaryText: '#333'
    }
  },
  {
    name: 'themeOrange',
    theme: {
      themePrimary: '#e36d36',
      themeLighterAlt: '#fbf2ed',
      themeLighter: '#f5dfd1',
      themeLight: '#ecb99a',
      themeTertiary: '#e9a079',
      themeSecondary: '#e68657',
      themeDarkAlt: '#cd5d2b',
      themeDark: '#b64c20',
      themeDarker: '#a03c15',
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
      neutralDark: '#212121',
      black: '#000000',
      white: '#fff',
      primaryBackground: '#fff',
      primaryText: '#333',
    }
  },
  {
    name: 'themeRed',
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
      neutralDark: '#212121',
      black: '#000000',
      white: '#fff',
      primaryBackground: '#fff',
      primaryText: '#333',
    }
  },
  {
    name: 'themePurple',
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
      neutralDark: '#212121',
      black: '#000000',
      white: '#fff',
      primaryBackground: '#fff',
      primaryText: '#333',
    }
  },
  {
    name: 'themeGreen',
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
      neutralDark: '#212121',
      black: '#000000',
      white: '#fff',
      primaryBackground: '#fff',
      primaryText: '#333',
    }
  },
  {
    name: 'themeGray',
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
      neutralDark: '#212121',
      black: '#000000',
      white: '#fff',
      primaryBackground: '#fff',
      primaryText: '#333',
    }
  },
  {
    name: 'themeDarkYellow',
    theme: {
      themePrimary: '#fce100',
      themeLighterAlt: '#fffef2',
      themeLighter: '#fffce5',
      themeLight: '#fffacb',
      themeTertiary: '#fff493',
      themeSecondary: '#ffe817',
      themeDarkAlt: '#e3cc00',
      themeDark: '#b19f00',
      themeDarker: '#8b7d00',
      neutralLighterAlt: '#353535',
      neutralLighter: '#4b4b4b',
      neutralLight: '#626262',
      neutralQuaternaryAlt: '#7f7f7f',
      neutralQuaternary: '#9f9f9f',
      neutralTertiaryAlt: '#bcbcbc',
      neutralTertiary: '#eaeaea',
      neutralSecondaryAlt: '#dadada',
      neutralSecondary: '#d0d0d0',
      neutralPrimary: '#ffffff',
      neutralDark: '#c8c8c8',
      black: '#767676',
      white: '#1f1f1f',
      primaryBackground: '#1f1f1f',
      primaryText: '#ffffff',
    }
  },
  {
    name: 'themeDarkBlue',
    theme: {
      themePrimary: '#00bcf2',
      themeLighterAlt: '#f2fcff',
      themeLighter: '#e4f9ff',
      themeLight: '#c9f3ff',
      themeTertiary: '#8fe7ff',
      themeSecondary: '#0ecbff',
      themeDarkAlt: '#00abda',
      themeDark: '#0085aa',
      themeDarker: '#006885',
      neutralLighterAlt: '#383e4e',
      neutralLighter: '#4a5166',
      neutralLight: '#5b647e',
      neutralQuaternaryAlt: '#757f9b',
      neutralQuaternary: '#979eb4',
      neutralTertiaryAlt: '#b6bccb',
      neutralTertiary: '#eaeaea',
      neutralSecondaryAlt: '#dadada',
      neutralSecondary: '#d0d0d0',
      neutralPrimary: '#ffffff',
      neutralDark: '#c8c8c8',
      black: '#767676',
      white: '#262a35',
      primaryBackground: '#262a35',
      primaryText: '#ffffff',
    }
  }
]

export class ChangeTheLookPanelExample extends React.Component<{}, IChangeTheLookPanelExampleState> {
  constructor() {
    super();
    this.state = { showPanel: false };
  }

  public render() {

    let changeTheLookStrings: ChangeTheLookPanelStrings = {
      saveButton: 'Save',
      cancelButton: 'Cancel',
      title: 'Change the Look',
      themeSampleText: 'Abc',
      changeTheLookPageLinkText: 'Navigate to bing'
    };

    let changeTheLookPanelProps: IChangeTheLookPanelProps = {
      themes: themes,
      onThemeClick: () => console.log('Theme clicked!'),
      isOpen: this.state.showPanel,
      strings: changeTheLookStrings,
      onSave:  () => console.log('Save clicked!'),
      onCancel: ()=> console.log('Cancel clicked!'),
      onDismiss: () => this._closePanel(),
      changeTheLookPageLink: 'http://www.bing.com',
      saveEnabled: true
    };

    return (
      <div>
        <Button description='Opens the Sample List Creation Panel' onClick={ this._showPanel }>Open Panel</Button>
        <ChangeTheLookPanel {...changeTheLookPanelProps} />
      </div>
    );
  }

  @autobind
  private _showPanel() {
    this.setState({ showPanel: true });
  }

  @autobind
  private _closePanel() {
    this.setState({ showPanel: false });
  }
}