# odsp-highcharts

## Setup prereq

Enlistment is part of `odsp-common`. Please see enlistment instructions for `odsp-common` instead.

## About this package

`odsp-highcharts` is used to build and publish an optimized release of the [Highcharts](https://www.highcharts.com/)
library for use in ODSP scenarios. Only the needed components are included and output is placed in an AMD-compatible
wrapper.

## Upgrading Highcharts

To assemble a custom build of Highcharts, we need to keep a drop of their sources. Therefore to move to a new version
of Highcharts, it's necessary to update the local copy of the sources. This requires the following steps...

1. Go to the [Highcharts Repository](https://github.com/highcharts/highcharts) and clone/download the sources.
2. Copy the folders `assembler`, `js`, and `css` from the repo sources to the `highcharts` folder in this project.
3. Update `HIGHCHARTS_VERSION` in `gulpfile.js`.
4. Check in a odsp-highcharts change file to bump version and publish a new @ms/odsp-highcharts private release.

## Adding additional Highcharts features

Please see [How to create custom Highcharts files](https://www.highcharts.com/docs/getting-started/how-to-create-custom-highcharts-files)
and add any new imports to the `highcharts.js` master file at the root of this project.