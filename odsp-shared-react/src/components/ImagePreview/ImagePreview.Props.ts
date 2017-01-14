import { IButtonProps } from 'office-ui-fabric-react/lib/components/Button';
import { IImageProps } from 'office-ui-fabric-react/lib/components/Image';
import 'es6-promise';

export interface IImagePreviewProps {
  /** The Image to show when the ImagePreview is first displayed. */
  initialPreviewImage: IImageProps;
  /**
   * A "default" Image to be shown in the preview, if initialPreviewImage is not the default. For example,
   * if a default image is available, but the user has, in the past, changed the image before displaying this
   * ImagePreview, this should be set to a value, to indicate that the remove button should be available. In this
   * case, the remove button would restore the default image. If this is left undefined, the remove button will only
   * be available if the user changes the image, and pressing it will revert the image back to initialPreviewImage.
   */
  emptyStateImage?: IImageProps;
  /** The width of the box the image should be shown in. */
  imageWidth: number;
  /** The height of the box the image should be shown in. */
  imageHeight: number;
  /** Strings for specifying the text of the buttons. */
  strings: IImagePreviewStrings;
  /** If this is true, forces the image to appear as though it is still loading. */
  forceShowLoading?: boolean;
  /** These properties will be applied to the button for changing the image. */
  changeButtonProps?: IButtonProps;
  /** These properties will be applied to the button for removing current the image. */
  removeButtonProps?: IButtonProps;
  /** This class will be applied to the div at the root of this component */
  additionalCssClass?: string;
  /** 
   * A callback that will be invoked when the change image button is clicked. The consumer of this component
   * is responsible for opening some sort of image picker or file picker and fullfulling the returned promise
   * with the result the user chooses. If the user cancels the action, the promise should just be rejected.
   */
  onClickChangeImage: () => Promise<IImageSelectedResponse>;
  /** A callback that will be invoked when the remove image button is clicked. It is not required. */
  onClickRemoveImage?: () => void;
}

export interface IImagePreviewState {
  /**
   * The src, either a url, or a binary string of the new image the user chose, if the user has chosen a new image.
   * This is only intended to be used internally, so the component knows what to display.
   */
  newPreviewSrc?: string;
  /* The file the user intends to upload, if the user intends to upload a file. */
  fileToUpload?: File;
  /* The url of the file the user intends to use, if the user intends to use a file already uploaded. */
  imageUrlToUse?: string;
  /* If true, the user clicked on the remove button and never chose or uploaded another image. */
  revertImage?: boolean;
}

export interface IImagePreviewStrings {
  /** This string will be used as the label of the change image button. */
  changeImageButtonText: string;
  /** This string will be used as the label of the remove image button. */
  removeImageButtonText: string;
}

export interface IImageSelectedResponse {
  /** The file the user chose to upload, if the user chose to upload a file */
  fileToUpload?: File;
  /**
   * If the user did not choose to upload a file, this should be set to the the url of the file the user chose.
   * If the user did choose to upload a file, this should be set to the binary string of that file.
   */
  src: string;
}
