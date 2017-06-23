interface ITeachingBubbleUserFact {
    /**
     * Is user dismissed flag. False if user has not dismissed it, True if they have.
     * @type {boolean}
     */
    d: boolean;
    /**
     * User's view count of the upsell.
     * We use a single letter to denote this field due to backend length constraints.
     * @type {number}
     */
    v: number;
}

export default ITeachingBubbleUserFact;