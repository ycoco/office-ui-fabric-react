import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IFormulaDataSet } from './IFormulaDataSet';

export interface IFormulaDataSource {
  /**
   * Retrieves formulas from the server.
   */
  getFormulas: () => Promise<IFormulaDataSet>;
}