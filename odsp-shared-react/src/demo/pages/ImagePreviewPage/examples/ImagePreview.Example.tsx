import * as React from 'react';
import { ImagePreview, IImagePreviewProps, IImageSelectedResponse } from '../../../../components/index';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';
import { ImageFit } from 'office-ui-fabric-react/lib/Image';
import { LocalFileReader } from '@ms/odsp-datasources/lib/File';
import './ImagePreview.Example.scss';

const IMAGE_WIDTH = 400;
const IMAGE_HEIGHT = 400;

export class ImagePreviewExample extends React.Component<React.Props<ImagePreviewExample>, any> {

  public refs: {
    [key: string]: React.ReactInstance;
    fileInput: HTMLInputElement;
  };

  private _resolvePromiseCallback: (value: IImageSelectedResponse) => void;
  private _rejectPromiseCallback: () => void;

  constructor() {
    super();
  }

  public render() {
    const previewProps: IImagePreviewProps = {
      initialPreviewImage: {
        src: 'dist/icon-one-96.png',
        imageFit: ImageFit.center
      },
      imageWidth: IMAGE_WIDTH,
      imageHeight: IMAGE_HEIGHT,
      changeButtonProps: { className: 'ms-ImagePreviewButton' },
      removeButtonProps: { className: 'ms-ImagePreviewButton' },
      strings: {
        changeImageButtonText: 'Change',
        removeImageButtonText: 'Remove'
      },
      onClickChangeImage: this._onClickChangeImage
    };

    return (
      <div className='ms-ImagePreviewExample-container' >
        <ImagePreview { ...previewProps } />
        <input
          ref='fileInput'
          className='ms-ImagePreviewExample-fileInput'
          type ='file'
          accept='.png;.jpg;.gif'
          tabIndex={ -1 }
          onChange={ this._onImageChanged }
          multiple={ false }
          />
      </div>
    );
  }

  private _resolveExistingPromise(response: IImageSelectedResponse): void {
    if (this._resolvePromiseCallback) {
      this._resolvePromiseCallback(response);
      this._resolvePromiseCallback = undefined;
    }
    this._rejectPromiseCallback = undefined;
  }

  private _rejectExistingPromise(): void {
    if (this._rejectPromiseCallback) {
      this._rejectPromiseCallback();
      this._rejectPromiseCallback = undefined;
    }
    this._resolvePromiseCallback = undefined;
  }

  @autobind
  private _onImageChanged(ev: React.FormEvent<HTMLInputElement>): void {
    const target: HTMLInputElement = ev.target as HTMLInputElement;
    if (target.files && target.files.length) {
      LocalFileReader.readFile(target.files[0]).then((value: string) => {
        this._resolveExistingPromise({
          src: value,
          fileToUpload: target.files[0]
        });
      }, (error: any) => {
        this._rejectExistingPromise();
      });
    } else {
      this._rejectExistingPromise();
    }
  }

  @autobind
  private _onClickChangeImage(): Promise<IImageSelectedResponse> {
    this._rejectExistingPromise();
    if (this.refs.fileInput) {
      this.refs.fileInput.click();
      return new Promise<IImageSelectedResponse>((resolve, reject) => {
        this._resolvePromiseCallback = resolve;
        this._rejectPromiseCallback = reject;
      });
    } else {
      return Promise.reject(new Error());
    }
  }
}
