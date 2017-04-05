import Promise from '@ms/odsp-utilities/lib/async/Promise';

/**
 * Helper function that returns a promise that resolves once the specified element exists.
 * @param {any} searchObj DOM element to scope the search to.
 * @param {string} querySelector query selector to find the element. Examples: '.classname' or '#id' or 'div'.
 * @param {string} elementIndex optional parameter specifying which element on the page that matches the selector to find. Example:    elementIndex 1 with querySelector 'div' finds the second div on the page
 * @returns {Promise<void>} Promise that will resolve when the element has been found. If
 * the element is not found within the time limit of 500 ms an error is thrown.
 */
export function WaitForElementToExist(searchObj: any, querySelector: string, elementIndex?: number): Promise<void> {
  let count = 0;
  let frequency = 10; // check for element every 10 ms
  let maxTime = 500; // wait for a maximum of 500 ms

  let waitForElement = function(complete: any, error: any) {
    let waiter = setInterval(() => {
      if (count * frequency <= maxTime) {
        count ++;
        let index = elementIndex ? elementIndex : 0;
        let element = searchObj.querySelectorAll(querySelector)[index];
        if (element) {
          clearInterval(waiter);
          complete();
        }
      } else {
        clearInterval(waiter);
        throw('Timed out waiting for element with query selector ' + querySelector);
      }
    }, frequency);
  }

  return new Promise<void>(waitForElement);
}