// OneDrive:IgnoreCodeCoverage

export const enum GuidedTourAction {
    Upload,
    Mobile,
    Sync,
    Share,
    Final
}

/**
 * An interface to describe the user's info about the guided tour
 */
interface IGuidedTourData {
    /**
     * Is user completed flag. 0 if user has not completed it, 1 if they have.
     * We use a single letter to denote this field due to backend length constraints.
     * @type {boolean}
     */
    c: boolean;
    /**
     * User's view count of the guided tour.
     * We use a single letter to denote this field due to backend length constraints.
     * @type {number}
     */
    v: number;
    /**
     * Has user uploaded. 0 if user has not uploaded a file, 1 if they have.
     * We use a single letter to denote this field due to backend length constraints.
     * @type {boolean}
     */
    u: boolean;
    /**
     * Has user completed mobile task. 0 if user has not finished the task, 1 if they have.
     * We use a single letter to denote this field due to backend length constraints.
     * @type {boolean}
     */
    m: boolean;
    /**
     * Has user completed sync task. 0 if user has not finished the task, 1 if they have.
     * We use a single letter to denote this field due to backend length constraints.
     * @type {boolean}
     */
    s: boolean;
    /**
     * Has user completed share task. 0 if user has not finished the task, 1 if they have.
     * We use two letters to denote this field due to backend length constraints and since 's' is taken
     * @type {boolean}
     */
    sh: boolean;
    /**
     * Has user completed final task. 0 if user has not finished the task, 1 if they have.
     * We use a single letter to denote this field due to backend length constraints.
     * @type {boolean}
     */
    f: boolean;
}

export default IGuidedTourData;