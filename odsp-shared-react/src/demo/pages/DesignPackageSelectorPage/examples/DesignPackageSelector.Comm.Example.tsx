import * as React from 'react';
import { DesignPackageSelector, IDesignPackageSelectorProps } from '../../../../components/DesignPackageSelector/index';
import WebTemplateType from '@ms/odsp-datasources/lib/dataSources/web/WebTemplateType';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

export class DesignPackageSelectorCommExample extends React.Component<React.Props<DesignPackageSelectorCommExample>, any> {
  constructor(props) {
    super(props);
    this.state = { currentDesignPackage: 'default' };
  }

  public render() {
    let sampleProps: IDesignPackageSelectorProps = {
      webTemplate: WebTemplateType.sitePagePublishing,
      designPackageResources: {
        teamSiteTitle: 'Team Site',
        teamSiteDescription: '***teamSiteDescription',

        reportSiteTitle: 'Report Site',
        reportSiteDescription: 'This design is great for keeping people connected to content and events that your team is working on.',

        portfolioSiteTitle: '***portfolioSiteTitle',
        portfolioSiteDescription: '***portfolioSiteDescription',

        blankSiteTitle: '***blankSiteTitle',
        blankSiteDescription: '***blankSiteDescription'
      },
      componentResources: {
        chooseDesignLabel: 'Choose a design'
      },
      designPackagePreviews: {
        reportSitePreviewUrl: 'http://placekitten.com/300/500',
        portfolioSitePreviewUrl: 'http://placekitten.com/300/501',
        blankSitePreviewUrl: 'http://placekitten.com/300/502',
        teamSitePreviewUrl: 'http://placekitten.com/300/503'
      },
      onSelectedDesignPackageChange: this._changeCurrentDesignPackage
    };

    return (
      <div>
        <DesignPackageSelector {...sampleProps} />
        <div>{this.state.currentDesignPackage}</div>
      </div>
    );
  }

  @autobind
  public _changeCurrentDesignPackage(designPackageId: string): void {
    this.setState({ currentDesignPackage: designPackageId });
  }
}
