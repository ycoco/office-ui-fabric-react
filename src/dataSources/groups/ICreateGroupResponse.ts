/**
 * Represents the response of a create group action.
 */
interface ICreateGroupResponse {
  /**
   * The response status.
   */
    status: string;
    /**
     * The response message.
     */
    response: string;
    /**
     * the id of the group that was created.
     */
    groupId: string;
}

export default ICreateGroupResponse;
