import * as React from 'react';
import { ExampleCard, PropertiesTableSet } from '../../components/index';
import { SiteHeaderImgLogoExample } from './examples/SiteHeader.ImgLogo.Example';
let SiteHeaderImgLogoExampleCode = require('./examples/SiteHeader.ImgLogo.Example.tsx');
import { SiteHeaderTextLogoExample } from './examples/SiteHeader.TextLogo.Example';
let SiteHeaderTextLogoExampleCode = require('./examples/SiteHeader.TextLogo.Example.tsx');

export default class SiteHeaderExample extends React.Component<any, any> {

  public render() {
    return (
      <div className='SiteHeaderExample'>
        <h1 className='ms-font-xxl'>Site Header</h1>
        <div>Site Header control for SP sites, as well as sites that are also O365 Groups.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='Site Header with Logo' code={ SiteHeaderImgLogoExampleCode }>
          <SiteHeaderImgLogoExample />
        </ExampleCard>
        <br /><br />
        <ExampleCard title='Site Header with Text' code={ SiteHeaderTextLogoExampleCode }>
          <SiteHeaderTextLogoExample />
        </ExampleCard>
        <PropertiesTableSet componentName='SiteHeader' />
      </div>
    );
  }
}
