import * as React from 'react';
import { autobind, css } from 'office-ui-fabric-react/lib/Utilities';
import { Button } from 'office-ui-fabric-react/lib/Button';
import { Image, IImageProps, ImageFit } from 'office-ui-fabric-react/lib/Image';
import { IImagePreviewProps, IImagePreviewState, IImageSelectedResponse } from './ImagePreview.Props';

export class ImagePreview extends React.Component<IImagePreviewProps, IImagePreviewState> {

  constructor(props: IImagePreviewProps) {
    super();
    this.state = {};
  }

  public render(): JSX.Element {
    let imageProps: IImageProps = undefined;
    /* tslint:disable:prefer-const */
    let {
      initialPreviewImage,
      forceShowLoading,
      strings,
      emptyStateImage,
      additionalCssClass,
      changeButtonProps,
      removeButtonProps
    }: IImagePreviewProps = this.props;
    /* tslint:enable:prefer-const */
    const {
      newPreviewSrc,
      revertImage
    }: IImagePreviewState = this.state;

    if (!forceShowLoading) {
      if (revertImage) {
        if (emptyStateImage) {
          imageProps = this._getPreviewImage(emptyStateImage.src, emptyStateImage.imageFit);
        } else if (initialPreviewImage) {
          imageProps = this._getPreviewImage(initialPreviewImage.src, initialPreviewImage.imageFit);
        } else {
          imageProps = this._getDefaultImage();
        }
      } else if (newPreviewSrc) {
        imageProps = this._getPreviewImage(newPreviewSrc, ImageFit.cover);
      } else if (initialPreviewImage) {
        imageProps = this._getPreviewImage(initialPreviewImage.src, initialPreviewImage.imageFit);
      } else {
        imageProps = this._getDefaultImage();
      }
    } else {
      imageProps = this._getDefaultImage();
    }

    changeButtonProps = changeButtonProps ? changeButtonProps : {};
    removeButtonProps = removeButtonProps ? removeButtonProps : {};

    let removeImageButton: JSX.Element = undefined;
    if (newPreviewSrc || (!revertImage && emptyStateImage && initialPreviewImage)) {
      removeImageButton = (
        <Button { ...removeButtonProps } onClick={ this._onClickRemoveImage } >
          {
            strings.removeImageButtonText
          }
        </Button>
      );
    }

    return (
      <div className={ css(additionalCssClass) } >
        <Image { ...imageProps as any } />
        <Button { ...changeButtonProps } onClick={ this._onClickChangeImage } >
          {
            strings.changeImageButtonText
          }
        </Button>
        {
          removeImageButton
        }
      </div>
    );
  }

  private _getPreviewImage(imageUrl: string, imageFit: ImageFit): IImageProps {
    return {
      src: imageUrl,
      width: this.props.imageWidth,
      height: this.props.imageHeight,
      imageFit: imageFit
    };
  }

  @autobind
  private _onImageSelected(response: IImageSelectedResponse): void {
    if (response && response.src) {
      if (response.fileToUpload) {
        this.setState({
          newPreviewSrc: response.src,
          imageUrlToUse: undefined,
          fileToUpload: response.fileToUpload,
          revertImage: false
        });
      } else {
        this.setState({
          newPreviewSrc: response.src,
          imageUrlToUse: response.src,
          fileToUpload: undefined,
          revertImage: false
        });
      }
    }
  }

  private _getDefaultImage(): IImageProps {
    return this._getPreviewImage('', ImageFit.cover);
  }

  @autobind
  private _onClickChangeImage(): void {
    if (this.props.onClickChangeImage) {
      this.props.onClickChangeImage().then(this._onImageSelected, (error: any) => { // tslint:disable-line:no-any
        // swallow the error. It just means that the user cancelled changing the image.
      });
    }
  }

  @autobind
  private _onClickRemoveImage(): void {
    if (this.props.onClickRemoveImage) {
      this.props.onClickRemoveImage();
    }
    this.setState({
      newPreviewSrc: undefined,
      fileToUpload: undefined,
      imageUrlToUse: undefined,
      revertImage: true
    });
  }
}
