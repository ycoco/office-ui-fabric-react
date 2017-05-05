interface IVisualizationAppInfo {
     /** The Id of the App */
    Id: string;

    /** The Uri used to design the app */
    DesignUri?: string;

    /** The Uri used to invoke the app at runtime */
    RuntimeUri?: string;
}

export default IVisualizationAppInfo;