import * as React from 'react';
import { SiteLogo, ISiteLogo } from '../../../../components/index';

export class SiteLogoTextLogoExample extends React.Component<React.Props<SiteLogoTextLogoExample>, {}> {
  constructor() {
    super();
  }

  public render() {
    let sampleProps: ISiteLogo = {
        siteTitle: `Share Point`,
        logoHref: '#',
        logoOnClick: () => { alert('You clicked on logo'); },
        siteAcronym: 'SP',
        siteLogoBgColor: '#7E3877'
      };

    return (
      <SiteLogo {...sampleProps} />
    );
  }
}
