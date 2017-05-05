import IVisualizationAppInfo from './IVisualizationAppInfo';

/** Information about the type of visualization that this SPView represents */
export const enum VisualizationType {
    /** This view uses the out-of-the-box visualization controls */
    Standard,

    /** This view uses various VisualizationStyleSets to define custom controls that show the data */
    Custom,

    /** This view uses an visualization App to display the data. */
    VisualizationApp
}

/** Contains CSS properties relating to how an individual field is layed out relative to it's container. */
export interface IVisualizationField {
    /** A Property which will specify which set of sub-elements to apply this set of CSS properties on. */
    InternalName?: string;

    /** A collection of CSS properties in serialized JSON format. */
    Style?: string;
}

/** Contains CSS properties for a list view in a specific screen resolution. */
export interface IVisualizationStyleSet {
    /** A property which will be used to calculate the width/height of an element. */
    AspectRatio?: string;

    /** A CSS property which will specify the minimum height of an element. */
    MinHeight?: string;

    /** A CSS property which will specify the background color of an element. */
    BackgroundColor?: string;

    /** A List of IVisualizationField objects which contain properties relating to how each field within the container will be layed out. */
    Fields?: IVisualizationField[];
}

/** Properties relating to how a list view is laid out. */
interface IVisualization {
    /** The type of visualization to be used for this view. */
    VisualizationType: VisualizationType;

    /** IVisualizationAppInfo object describing the app to be used for displaying this view */
    VisualizationAppInfo?: IVisualizationAppInfo;

    /** IVisualizationStyleSet object containing CSS properties that will catered towards small sized screens. */
    SmallScreen?: IVisualizationStyleSet;

    /** IVisualizationStyleSet object containing CSS properties that will catered towards medium sized screens. */
    MediumScreen?: IVisualizationStyleSet;

    /** IVisualizationStyleSet object containing CSS properties that will catered towards all screens when a small or medium style is not present or not needed. */
    DefaultScreen?: IVisualizationStyleSet;

    /** IVisualizationStyleSet object containing CSS properties for Detailed listview. */
    DetailView?: IVisualizationStyleSet;
}

export default IVisualization;