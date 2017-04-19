import { IDesignPackage } from '../../providers/designPackage/DesignPackageProvider';
import WebTemplateType from '../web/WebTemplateType';
import { IFormulaDataSet, IFormulaDataSetQuery } from './IFormulaDataSet';

export class FormulaDataSet implements IFormulaDataSet {

  private _formulas: IDesignPackage[];
  private _cache: { [key: string]: IDesignPackage[] };

  constructor(formulas: IDesignPackage[]) {
    this._formulas = formulas;
    this._cache = {};
  }

  /**
   * Optional. If specified, queries for formulas with this web template type.
   */
  public getFormulas(query?: IFormulaDataSetQuery) {
    if (!query || query.webTemplate === undefined || query.webTemplate === null) {
      return this._formulas;
    }

    let cacheStr: string = query.webTemplate.toString();
    if (!this._cache[cacheStr]) {
      this._cache[cacheStr] = this._getFormulasForTemplate(query.webTemplate);
    }
    return this._cache[cacheStr];

  }

  private _getFormulasForTemplate(webTemplate: WebTemplateType): IDesignPackage[] {
    let result: IDesignPackage[] = [];

    for (let i: number = 0; i < this._formulas.length; i++) {
      if (this._formulas[i].supportedTemplates.indexOf(webTemplate) > -1) {
        result.push(this._formulas[i]);
      }
    }

    return result;
  }

}
