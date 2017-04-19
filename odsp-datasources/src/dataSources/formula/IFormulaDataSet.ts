import { IDesignPackage } from '../../providers/designPackage/DesignPackageProvider';
import WebTemplateType from '../web/WebTemplateType';

export interface IFormulaDataSetQuery {
  /**
   * Optional. If specified, queries for formulas with this web template type.
   */
  webTemplate?: WebTemplateType;
}

export interface IFormulaDataSet {
  /**
   * Get the formulas in this data set.
   * @param query Optional. If provided, this filters the set of returned formulas.
   */
  getFormulas: (query?: IFormulaDataSetQuery) => IDesignPackage[];
}