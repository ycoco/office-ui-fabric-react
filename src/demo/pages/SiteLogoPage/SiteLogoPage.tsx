import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import { SiteLogoImageLogoExample } from './examples/SiteLogo.ImageLogo.Example';
import { SiteLogoTextLogoExample } from './examples/SiteLogo.TextLogo.Example';

const SiteLogoImageLogoExampleCode = require('./examples/SiteLogo.ImageLogo.Example.tsx');
const SiteLogoTextLogoExampleCode = require('./examples/SiteLogo.TextLogo.Example.tsx');

export class SiteLogoPage extends React.Component<any, any> {

  public render() {
    let longImg: any = { img: 'http://placekitten.com/240/96' };
    let regularImg: any = { img: 'http://placeimg.com/96/96/animals' };
    let tallImg: any = { img: 'http://placekitten.com/96/240' };
    return (
      <div className='GroupCardExample'>
        <h1 className='ms-font-xxl'>Site Logo example</h1>
        <div>GroupCard component </div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='SiteLogo with regular image' code={ SiteLogoImageLogoExampleCode }>
          <SiteLogoImageLogoExample { ...regularImg } />
        </ExampleCard>
        <br /><br />

        <ExampleCard title='SiteLogo with long horizontal image' code={ SiteLogoImageLogoExampleCode }>
          <SiteLogoImageLogoExample { ...longImg } />
        </ExampleCard>
        <br /><br />

        <ExampleCard title='SiteLogo with tall vertical image' code={ SiteLogoImageLogoExampleCode }>
          <SiteLogoImageLogoExample { ...tallImg } />
        </ExampleCard>
        <br /><br />

        <ExampleCard title='SiteLogo with acronym' code={ SiteLogoTextLogoExampleCode }>
          <SiteLogoTextLogoExample />
        </ExampleCard>
        <br /><br />

        <PropertiesTableSet componentName='SiteLogo' />
      </div>
    );
  }
}
