import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import { DesignPackageSelectorCommExample } from './examples/DesignPackageSelector.Comm.Example';
import { DesignPackageSelectorTeamExample } from './examples/DesignPackageSelector.Team.Example';
import './DesignPackageSelectorPage.scss';

const DesignPackageSelectorCommExampleCode = require('./examples/DesignPackageSelector.Comm.Example.tsx');
const DesignPackageSelectorTeamExampleCode = require('./examples/DesignPackageSelector.Team.Example.tsx');

export class DesignPackageSelectorPage extends React.Component<any, any> {
  public render() {
    return (
      <div className='DesignPackageSelectorExample'>
        <h1 className='ms-font-xxl'>Design Package Selector example</h1>
        <div>Panel used to select the design package for a web.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='DesignPackageSelectorComm' code={ DesignPackageSelectorCommExampleCode }>
          <div className='DesignPackageSelectorExampleCard ms-bgColor-neutralLight'>
            <DesignPackageSelectorCommExample />
          </div>
        </ExampleCard>
        <ExampleCard title='DesignPackageSelectorTeam' code={ DesignPackageSelectorTeamExampleCode }>
          <div className='DesignPackageSelectorExampleCard ms-bgColor-neutralLight'>
            <DesignPackageSelectorTeamExample />
          </div>
        </ExampleCard>

        <br /><br />
        <PropertiesTableSet componentName='DesignPackageSelector' />
      </div>
    );
  }
}
