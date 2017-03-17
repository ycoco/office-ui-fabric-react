import Promise from '@ms/odsp-utilities/lib/async/Promise';

/**
 * Helper function that returns a promise that resolves once the specified element exists.
 * @param {any} searchObj DOM element to scope the search to.
 * @param {string} querySelector query selector to find the element. Examples: '.classname' or '#id' or 'div'.
 * @returns {Promise<void>} Promise that will resolve when the element has been found. If
 * the element is not found within the time limit of 500 ms an error is thrown.
 */
export function WaitForElementToExist(searchObj: any, querySelector: string): Promise<void> {
  let count = 0;
  let frequency = 10; // check for element every 10 ms
  let maxTime = 500; // wait for a maximum of 500 ms

  let waitForElement = function(complete: any, error: any) {
    let waiter = setInterval(() => {
      if (count * frequency <= maxTime) {
        count ++;
        let element = searchObj.querySelector(querySelector);
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