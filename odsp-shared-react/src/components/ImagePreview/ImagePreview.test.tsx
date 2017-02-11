import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';
import 'es6-promise';

import { IImageProps, ImageFit } from 'office-ui-fabric-react/lib/components/Image';

import { assert, expect } from 'chai';

import { ImagePreview } from './ImagePreview';
import {
  IImagePreviewProps,
  IImageSelectedResponse,
  IImagePreviewStrings
} from './ImagePreview.Props';

const BUTTON_STRINGS: IImagePreviewStrings = {
  changeImageButtonText: 'change',
  removeImageButtonText: 'remove'
};

const WIDTH: number = 50;
const HEIGHT: number = 60;

/* tslint:disable:max-line-length */
const testImage1x1: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQImWP4DwQACfsD/eNV8pwAAAAASUVORK5CYII=';
const testImage1x2: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWP4////fyYGBgYGAB32A/+PRyXoAAAAAElFTkSuQmCC';
const testImage2x1: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEUlEQVQImWP8////fwYGBgYAGfgD/hEzDhoAAAAASUVORK5CYII=';
/* tslint:enable:max-line-length */

const REMOVE_BUTTON_CLASS_NAME: string = 'removebuttonclass';
const CHANGE_BUTTON_CLASS_NAME: string = 'changebuttonclass';

const WAIT_FOR_MAX_TIMEOUT: number = 500;
const WAIT_FOR_TIMEOUT: number = 2;
function waitFor(condition: () => boolean): Promise<void> {
  let totalWait: number = 0;
  if (condition()) {
    return Promise.resolve<void>();
  }

  return new Promise<void>((resolve, reject) => {
    const timeoutFunction: () => void = () => {
      if (condition()) {
        resolve();
      } else if (totalWait >= WAIT_FOR_MAX_TIMEOUT) {
        assert(false, 'Failed due to waitFor() timeout');
        reject();
      } else {
        totalWait += WAIT_FOR_TIMEOUT;
        setTimeout(timeoutFunction, WAIT_FOR_TIMEOUT);
      }
    };
    setTimeout(timeoutFunction, WAIT_FOR_TIMEOUT);
  });
}

describe('ImagePreview', () => {

  afterEach(() => {
    for (let i: number = 0; i < document.body.children.length; i++) {
      if (document.body.children[i].tagName === 'DIV') {
        document.body.removeChild(document.body.children[i]);
        i--;
      }
    }
  });

  it('allows initial images to be removed', (done) => {
    const INITIAL_IMAGE: IImageProps = {
      src: testImage1x1,
      imageFit: ImageFit.cover
    };
    const EMPTY_IMAGE: IImageProps = {
      src: testImage1x2,
      imageFit: ImageFit.center
    };

    const previewProps: IImagePreviewProps = {
      initialPreviewImage: INITIAL_IMAGE,
      emptyStateImage: EMPTY_IMAGE,
      imageWidth: WIDTH,
      imageHeight: HEIGHT,
      strings: BUTTON_STRINGS,
      removeButtonProps: {
        className: REMOVE_BUTTON_CLASS_NAME
      },
      onClickChangeImage: undefined
    };

/* tslint:disable:no-any */
    const imagePreviewComponent: any = ReactTestUtils.renderIntoDocument<ImagePreview>(
      <ImagePreview { ...previewProps } />
    );

    let renderedDOM: any = ReactDom.findDOMNode(imagePreviewComponent);
    let img: HTMLImageElement = renderedDOM.querySelector('img.ms-Image-image') as HTMLImageElement;
    expect(img.src).to.equal(INITIAL_IMAGE.src);

    const removeButton: any = renderedDOM.querySelector('.' + REMOVE_BUTTON_CLASS_NAME);
/* tslint:enable:no-any */
    expect(removeButton).to.be.ok;

    ReactTestUtils.Simulate.click(removeButton);

    renderedDOM = ReactDom.findDOMNode(imagePreviewComponent);
    img = renderedDOM.querySelector('img.ms-Image-image') as HTMLImageElement;
    expect(img.src).to.equal(EMPTY_IMAGE.src);

    done();
  });

  it('allows changed images to be removed', (done) => {
    const INITIAL_IMAGE: IImageProps = {
      src: testImage1x1,
      imageFit: ImageFit.cover
    };

    const CHANGED_IMAGE_SRC: string = testImage2x1;

    const onClickChangeImage: () => Promise<IImageSelectedResponse> = () => {
      return Promise.resolve({
        src: CHANGED_IMAGE_SRC
      });
    };

    const previewProps: IImagePreviewProps = {
      initialPreviewImage: INITIAL_IMAGE,
      emptyStateImage: undefined,
      imageWidth: WIDTH,
      imageHeight: HEIGHT,
      strings: BUTTON_STRINGS,
      removeButtonProps: {
        className: REMOVE_BUTTON_CLASS_NAME
      },
      changeButtonProps: {
        className: CHANGE_BUTTON_CLASS_NAME
      },
      onClickChangeImage: onClickChangeImage
    };
/* tslint:disable:no-any */
    const imagePreviewComponent: any = ReactTestUtils.renderIntoDocument<ImagePreview>(
      <ImagePreview { ...previewProps } />
    );

    let renderedDOM: any = ReactDom.findDOMNode(imagePreviewComponent);
    let img: HTMLImageElement = renderedDOM.querySelector('img.ms-Image-image') as HTMLImageElement;
    expect(img.src).to.equal(INITIAL_IMAGE.src);

    const changeButton: any = renderedDOM.querySelector('.' + CHANGE_BUTTON_CLASS_NAME);
    expect(changeButton).to.be.ok;
/* tslint:enable:no-any */

    ReactTestUtils.Simulate.click(changeButton);

    waitFor(() => {
      renderedDOM = ReactDom.findDOMNode(imagePreviewComponent);
      img = renderedDOM.querySelector('img.ms-Image-image') as HTMLImageElement;
      return img.src === CHANGED_IMAGE_SRC;
    }).then(() => {
      expect(img.src).to.equal(CHANGED_IMAGE_SRC);

/* tslint:disable:no-any */
      const removeButton: any = renderedDOM.querySelector('.' + REMOVE_BUTTON_CLASS_NAME);
      expect(removeButton).to.be.ok;
/* tslint:enable:no-any */

      ReactTestUtils.Simulate.click(removeButton);

      renderedDOM = ReactDom.findDOMNode(imagePreviewComponent);
      img = renderedDOM.querySelector('img.ms-Image-image') as HTMLImageElement;
      expect(img.src).to.equal(INITIAL_IMAGE.src);

      done();

    });
  });
});
