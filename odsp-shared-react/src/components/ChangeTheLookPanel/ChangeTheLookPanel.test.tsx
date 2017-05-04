import * as React from 'react';

import * as ReactDOM from 'react-dom';

import { ChangeTheLookPanel, ChangeTheLookPanelStrings } from './index';
import chai = require('chai');

const expect = chai.expect;

const strings: ChangeTheLookPanelStrings = {
  saveButton: 'save',
  cancelButton: 'cancel',
  themeSampleText: 'abc',
  title: 'Change the Theme',
  changeTheLookPageLinkText: 'Go back'
}

const themes = [
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

describe('ChangeTheLookPanel', () => {
  it('Renders the panel with a list of themes.', (done) => {
    let div = document.createElement('div');
    let themeClicked = () => {
      done();
    }

    ReactDOM.render(<ChangeTheLookPanel
      themes={ themes }
      strings={ strings }
      onThemeClick={ themeClicked }
      onCancel={ () => void 0 }
      onSave={ () => void 0 }
      isOpen={ true } />, div);

    let themeList = document.querySelectorAll('.sp-ThemeListItem-container');

    expect(themeList.length).to.be.eq(5, "There were not 5 themes");
    (themeList[3] as HTMLElement).click();
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
  });

  it('gets save button clicked', (done) => {
    let div = document.createElement('div');
    let saveClick = () => {
      done();
    }
    ReactDOM.render(<ChangeTheLookPanel
      themes={ themes }
      strings={ strings }
      onThemeClick={ () => void 0 }
      onCancel={ () => void 0 }
      onSave={ () => saveClick() }
      saveEnabled={ true }
      isOpen={ true } />, div);
    let saveButton = document.querySelector('[data-automationid="changethelookpanel-savebutton"]');

    (saveButton as HTMLElement).click();
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
  });

  it('gets cancel button clicked', (done) => {
    let div = document.createElement('div');
    let cancelClick = () => {
      done();
    }

    ReactDOM.render(<ChangeTheLookPanel
      themes={ themes }
      strings={ strings }
      onThemeClick={ () => void 0 }
      onCancel={ () => cancelClick() }
      onSave={ () => void 0 }
      isOpen={ true } />, div);

    let cancelButton = document.querySelector('[data-automationid="changethelookpanel-cancelbutton"]');

    (cancelButton as HTMLElement).click();
    ReactDOM.unmountComponentAtNode(div);
    div.remove();

  });

});

