export interface IListPermissions {
    /**
     * Whether or not the user may manage the list.
     *
     * @type {boolean}
     */
    manageLists?: boolean;
    /**
     * Whether or not the user may make personalized views for the list.
     *
     * @type {boolean}
     */
    managePersonalViews?: boolean;
    /**
     * Whether or not the user may open items in the list.
     *
     * @type {boolean}
     */
    openItems?: boolean;
}

export default IListPermissions;
