import * as React from 'react';
import { SiteLogo, ISiteLogo } from '../../../../components/index';
import { assign } from 'office-ui-fabric-react/lib/Utilities';
import './SiteLogo.ImageLogo.Example.scss';

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

    let samplePropsWithSize: ISiteLogo = assign({}, sampleProps);
    samplePropsWithSize.size = 56;

    let samplePropsWithSizeAndRounded: ISiteLogo = assign({}, samplePropsWithSize);
    samplePropsWithSizeAndRounded.roundedCorners = true;
    return (
      <div className='rootElement'>
        <SiteLogo {...sampleProps} />
        <SiteLogo {...samplePropsWithSize} />
        <SiteLogo {...samplePropsWithSizeAndRounded} />
      </div>
    );
  }
}
