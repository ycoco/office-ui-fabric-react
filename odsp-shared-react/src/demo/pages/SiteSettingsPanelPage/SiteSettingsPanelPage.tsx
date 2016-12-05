import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import { SiteSettingsPanelExample } from './examples/SiteSettingsPanel.Example';
import { SiteSettingsPanelTextLogoExample } from './examples/SiteSettingsPanel.TextLogo.Example';
import { SiteSettingsPanelImageLogoExample } from './examples/SiteSettingsPanel.ImageLogo.Example';

const SiteSettingsPanelExampleCode = require('./examples/SiteSettingsPanel.Example.tsx');
const SiteSettingsPanelTextLogoExampleCode = require('./examples/SiteSettingsPanel.TextLogo.Example.tsx');
const SiteSettingsPanelImageLogoExampleCode = require('./examples/SiteSettingsPanel.ImageLogo.Example.tsx');

export class SiteSettingsPanelPage extends React.Component<any, any> {
  public render() {
    return (
      <div className='SiteSettingsPanelExample'>
        <h1 className='ms-font-xxl'>Site Settings Panel example</h1>
        <div>Panel used to permit customization of group or site settings.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='SiteSettingsPanel' code={ SiteSettingsPanelExampleCode }>
          <SiteSettingsPanelExample />
        </ExampleCard>
        <ExampleCard title='SiteSettingsPanelTextLogo' code={ SiteSettingsPanelTextLogoExampleCode }>
          <SiteSettingsPanelTextLogoExample />
        </ExampleCard>
        <ExampleCard title='SiteSettingsPanelImageLogo' code={ SiteSettingsPanelImageLogoExampleCode }>
          <SiteSettingsPanelImageLogoExample />
        </ExampleCard>
        <br /><br />

        <PropertiesTableSet componentName='SiteSettingsPanel' />
      </div>
    );
  }
}
