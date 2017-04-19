import './DesignPackageSelector.scss';
import * as React from 'react';
import { IDesignPackageSelectorProps } from './DesignPackageSelector.Props';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Image } from 'office-ui-fabric-react/lib/Image';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import * as DesignPackageProvider from '@ms/odsp-datasources/lib/DesignPackage';

export interface IDesignPackageSelectorState {
  selectedDesignPackageIndex?: number;
}

export class DesignPackageSelector extends React.Component<IDesignPackageSelectorProps, IDesignPackageSelectorState> {
  private designPackages: DesignPackageProvider.IDesignPackage[];

  constructor(props: IDesignPackageSelectorProps) {
    super(props);
    this.designPackages = DesignPackageProvider.getDesignPackagesForTemplate(props.designPackageResources, props.webTemplate);
    if (props.additionalDesignPackages) {
      this.designPackages = this.designPackages.concat(props.additionalDesignPackages);
    }
    this.state = {
      selectedDesignPackageIndex: 0
    };
  }

  public componentWillReceiveProps(nextProps: IDesignPackageSelectorProps) {
    if (nextProps.webTemplate !== this.props.webTemplate) {
      this.designPackages = DesignPackageProvider.getDesignPackagesForTemplate(nextProps.designPackageResources, nextProps.webTemplate);
      if (nextProps.additionalDesignPackages) {
        this.designPackages = this.designPackages.concat(nextProps.additionalDesignPackages);
      }
      this.setState({
        selectedDesignPackageIndex: 0
      });
    }
  }

  public componentDidMount() {
    Engagement.logData({ name: 'DesignPackageSelector.Opened' });
  }

  public render(): React.ReactElement<IDesignPackageSelectorProps> {
    return (
      <div className='ms-designPackageSelector ms-bgColor-neutralLight'>
          <div className='ms-designPackageSelector-choiceSection'>
            <Dropdown className='ms-designPackageSelector-choiceSelection'
              label={this.props.componentResources.chooseDesignLabel}
              options={this.designPackages.map((designPackage, index) =>
                ({ key: designPackage.id, text: designPackage.title, index: index })
              )}
              onChanged={this._setDesignPackage}
              defaultSelectedKey={this.designPackages && this.designPackages.length > 0 ? this.designPackages[0].id : undefined }
            />
            <div className='ms-designPackageSelector-choiceDescription'>
              {this._getCurrentDesignPackage().description}
            </div>
          </div>
          <div className='ms-designPackageSelector-previewSection'>
            <Image className='ms-designPackageSelector-previewImage'
              src={this._getImageForDesignPackage()}
              maximizeFrame={ true } />
          </div>
      </div>
    );
  }

  @autobind
  private _setDesignPackage(option: IDropdownOption) {
    Engagement.logData({ name: 'DesignPackageSelector.setDesignPackage.Click' });
    this.setState({
      selectedDesignPackageIndex: option.index
    });

    this.props.onSelectedDesignPackageChange(String(option.key));
  }

  private _getCurrentDesignPackage(): DesignPackageProvider.IDesignPackage {
    return this.designPackages[this.state.selectedDesignPackageIndex];
  }

  private _getImageForDesignPackage(): string {
    const selectedDesignPackageId: string = this._getCurrentDesignPackage().id;
    switch (selectedDesignPackageId) {
      case DesignPackageProvider.TEAMSITE_DESIGNPACKAGEID:
        return this.props.designPackagePreviews.teamSitePreviewUrl;
      case DesignPackageProvider.PORTFOLIOSITE_DESIGNPACKAGEID:
        return this.props.designPackagePreviews.portfolioSitePreviewUrl;
      case DesignPackageProvider.BLANKSITE_DESIGNPACKAGEID:
        return this.props.designPackagePreviews.blankSitePreviewUrl;
      default: // DesignPackageProvider.REPORTSITE_DESIGNPACKAGEID
        return this.props.designPackagePreviews.reportSitePreviewUrl;
    }
  }
}