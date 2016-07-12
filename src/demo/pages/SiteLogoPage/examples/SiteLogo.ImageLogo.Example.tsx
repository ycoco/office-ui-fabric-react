import * as React from 'react';
import { SiteLogo, ISiteLogo } from '../../../../components/index';

export class SiteLogoImageLogoExample extends React.Component<React.Props<SiteLogoImageLogoExample>, {}> {
  private _img: string;

  constructor(img: any) {
    super(img);
    this._img = img.img;
  }

  public render() {
    let sampleProps: ISiteLogo = {
        siteTitle: `Lorem Ipsum`,
        logoHref: '#',
        logoOnClick: () => { alert('You clicked on logo'); },
        siteLogoUrl: this._img
    };

    return (
      <SiteLogo {...sampleProps} />
    );
  }
}
