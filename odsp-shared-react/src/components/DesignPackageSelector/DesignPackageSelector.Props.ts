import * as React from 'react';
import WebTemplateType from '@ms/odsp-datasources/lib/interfaces/WebTemplateType';
import { IDesignPackageResources, IDesignPackageAssets } from '@ms/odsp-datasources/lib/DesignPackage';
import { DesignPackageSelector } from './DesignPackageSelector';
import { IDesignPackage } from '@ms/odsp-datasources/lib/DesignPackage';

export interface IDesignPackageSelectorProps extends React.Props<DesignPackageSelector>{
  /**
   * The web template of the SPWeb that the design package will be set on.
   * Some design packages only support certain web templates, so we filter based on this.
   */
  webTemplate: WebTemplateType,
  
  /**
   * Resources belonging to this component
   */
  componentResources: {
    chooseDesignLabel?: string,
  }

  /**
   * Resources belonging to design packages themselves Not self-contained because of
   * horrendous code repository constraints.
   */
  designPackageResources: IDesignPackageResources,

  /**
   * Design Package preview image URLs
   */
  designPackagePreviews: IDesignPackageAssets,

  /**
   * Callback for when the selection of Design package changes
   */
  onSelectedDesignPackageChange: (designPackageId: string) => void
  
  /**
   * Optional. If provided, these design packages will be appended
   * to the ones from the DesignPackageProvider.
   */
  additionalDesignPackages?: IDesignPackage[];
}