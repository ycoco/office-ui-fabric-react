
// OneDrive:IgnoreCodeCoverage

export const VALUE_KEY = 'value';

/**
 * Component which manages state stored in the {window} object, via {window.name}.
 * @example
 *  let windowStateManager = new WindowStateManager();
 *  windowStateManager.setState('test', { stuff: 'goes here' });
 *  let testData = windowStateManager.getState('test');
 *  expect(testData.stuff).to.equal('goes here');
 */
export default class WindowStateManager {
    /**
     * Gets a subset of state from the window.name value.
     * Parses window.name as JSON and returns the value at the given subkey.
     */
    public getState<T>(key: string): T {
        let data = this._getNormalizedWindowName();

        return data[key];
    }

    /**
     * Stores a subset of data into the window.name value.
     * Converts window.name to JSON and stores the value at the given subkey.
     */
    public setState<T>(key: string, state: T) {
        let data = this._getNormalizedWindowName();

        data[key] = state;

        window.name = JSON.stringify(data);
    }

    /**
     * Removes a subset of data from the window.name value.
     * Converts window.name to JSON and removes the value at the given subkey.
     */
    public removeState<T>(key: string): T {
        let data = this._getNormalizedWindowName();

        let state = <T>data[key];

        delete data[key];

        window.name = JSON.stringify(data);

        return state;
    }

    private _getNormalizedWindowName() {
        let data: any;

        try {
            data = JSON.parse(name) || {};
        } catch (error) {
            data = {};
        }

        if (typeof data !== 'object') {
            data = { [VALUE_KEY]: data };
        }

        return data;
    }
}
