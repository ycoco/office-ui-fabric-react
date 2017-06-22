# Change Log - @ms/odsp-utilities

This log was last generated on Thu, 22 Jun 2017 02:30:02 GMT and should not be manually modified.

## 21.15.0
Thu, 22 Jun 2017 02:30:02 GMT

### Minor changes

- Add image thumbnail generator helper

## 21.14.0
Wed, 21 Jun 2017 22:45:36 GMT

### Minor changes

- Adding localized datetime strings

## 21.13.0
Tue, 20 Jun 2017 22:12:43 GMT

### Minor changes

- copied SchemaMapper to odsp-utilities/object

## 21.11.3
Mon, 19 Jun 2017 18:12:50 GMT

### Patches

- Allow all DEBUG builds to use FeatureOverrides

## 21.11.2
Fri, 16 Jun 2017 01:03:28 GMT

### Patches

- Adding fr-ca, es-mx, lo cultures to sources.json

## 21.11.1
Tue, 13 Jun 2017 15:38:14 GMT

### Patches

- Updating typescript, adding tslib dependency.

## 21.11.0
Mon, 12 Jun 2017 22:58:25 GMT

### Minor changes

- Revert EventGroup refactor to unblock TAB tests

## 21.10.1
Fri, 09 Jun 2017 20:43:33 GMT

### Patches

- Fix EventGroup/event disposal

## 21.10.0
Fri, 09 Jun 2017 00:37:35 GMT

### Minor changes

- Return IDisposable subscriptions from EventGroup#on

## 21.9.1
Tue, 06 Jun 2017 18:03:46 GMT

### Patches

- Remove IE8 Support in EventGroup, fix StopPropagation

## 21.9.0
Thu, 01 Jun 2017 06:51:12 GMT

### Minor changes

- rumone change to support secondary controls

## 21.8.0
Thu, 18 May 2017 22:28:33 GMT

### Minor changes

- Add decodeHtmlEntities function

## 21.7.1
Thu, 18 May 2017 01:14:44 GMT

### Patches

- Eliminate circular dependency in PerformanceCollection

## 21.7.0
Tue, 16 May 2017 17:45:10 GMT

### Minor changes

- Move filterSelect control and related code to odsp-common

## 21.6.1
Thu, 11 May 2017 22:54:47 GMT

### Patches

- Fix error handling in Async

## 21.6.0
Thu, 11 May 2017 22:23:49 GMT

### Minor changes

- Allow control of resource async loading

## 21.5.1
Thu, 11 May 2017 18:31:00 GMT

### Patches

- Fix handling of Experiment in EngagementHelper

## 21.5.0
Fri, 05 May 2017 23:15:24 GMT

### Minor changes

- Optimize Engagement modules for bundling

## 21.4.2
Fri, 05 May 2017 20:28:33 GMT

### Patches

- Localizes file size strings

## 21.4.1
Thu, 04 May 2017 23:25:04 GMT

### Patches

- Checks if localStorage exists before accessing properties on it.

## 21.4.0
Wed, 03 May 2017 23:17:48 GMT

### Minor changes

- Define EngagementHelper component and naming system

## 21.3.2
Fri, 21 Apr 2017 21:23:19 GMT

### Patches

- Updating fabric-react dependency to 2.21.0.

## 21.3.1
Thu, 20 Apr 2017 18:54:47 GMT

### Patches

- del with folder size being negative. return empty string for that.

## 21.3.0
Wed, 19 Apr 2017 21:46:08 GMT

### Minor changes

- Add async resource key helper

## 21.2.1
Sat, 15 Apr 2017 01:07:55 GMT

### Patches

- IThemeData make typing [key:string]: RgbaColor | undefined

## 21.2.0
Fri, 14 Apr 2017 02:05:13 GMT

### Minor changes

- Added in support for theming, also fixed a bug where modern themes might not appear correctly when loaded from  the server

## 21.1.1
Fri, 14 Apr 2017 00:12:24 GMT

### Patches

- override require onError only when require JS is available, so I can use this utilities function in sp-client

## 21.1.0
Tue, 11 Apr 2017 17:03:18 GMT

### Minor changes

- Migrate SimpleUri utility from odsp-next

## 21.0.0
Thu, 06 Apr 2017 04:54:37 GMT

### Breaking changes

- Update ProtocolHandlerHelper to support more states  and add tests

## 20.7.2
Fri, 31 Mar 2017 07:30:50 GMT

### Patches

- Add API to add flights enabled for the page

## 20.7.1
Fri, 31 Mar 2017 03:18:17 GMT

### Patches

- Use VSTS npm feed (no real code change)

## 20.7.0
Thu, 30 Mar 2017 21:50:11 GMT

### Minor changes

- Adds function to format strings with JSX objects.

## 20.6.3
Tue, 28 Mar 2017 22:25:24 GMT

### Patches

- Give Component its own child resource scope when using dependencies

## 20.6.2
Wed, 22 Mar 2017 19:47:28 GMT

### Patches

- remove non-text file extensions from code set

## 20.6.1
Wed, 22 Mar 2017 01:05:48 GMT

### Patches

- API to skip a page from collecting perf data

## 20.6.0
Mon, 20 Mar 2017 19:50:21 GMT

### Minor changes

- refactor perf marker code to support safari

## 20.5.0
Fri, 17 Mar 2017 23:31:28 GMT

### Minor changes

- Moving ProtocolHandlerHelper from odsp-next to odsp-utilities

## 20.4.0
Fri, 17 Mar 2017 18:26:27 GMT

### Minor changes

- Enable scenarios without window["_spPageContextInfo"]

## 20.3.0
Fri, 17 Mar 2017 06:14:25 GMT

### Minor changes

- fix perf telemetry for safari

## 20.2.10
Wed, 15 Mar 2017 23:43:40 GMT

### Patches

- Remove isConsoleOpen check

## 20.2.9
Tue, 14 Mar 2017 00:06:00 GMT

### Patches

- Add Engagement test, make ARIA tests more strict

## 20.2.8
Fri, 10 Mar 2017 01:56:53 GMT

### Patches

- Optional control to let logger know when all expected controls has been added

## 20.2.7
Thu, 09 Mar 2017 01:40:35 GMT

### Patches

- Remove bogus extensions

## 20.2.6
Thu, 09 Mar 2017 00:45:18 GMT

### Patches

- Update ARIA imports and package references

## 20.2.5
Wed, 08 Mar 2017 23:28:39 GMT

### Patches

- Adding more file types for text editor to handle

## 20.2.4
Tue, 07 Mar 2017 23:13:37 GMT

### Patches

- Reducing junk perf data collection from developers desk

## 20.2.3
Sun, 05 Mar 2017 17:57:10 GMT

### Patches

- fix QoS in SPAlternativeUrl API

## 20.2.2
Sat, 04 Mar 2017 20:57:25 GMT

### Patches

- fix culture in Locale API

## 20.2.1
Wed, 01 Mar 2017 18:03:51 GMT

### Patches

- Update to onedrive-buildtools@41.1.2

## 20.2.0
Tue, 28 Feb 2017 22:29:57 GMT

### Minor changes

- add support for private CDN

## 20.1.0
Sat, 25 Feb 2017 00:07:34 GMT

### Minor changes

- perf instrumentation change to support onepage app

## 20.0.4
Sat, 18 Feb 2017 02:26:26 GMT

### Patches

- fix tslint

## 20.0.3
Fri, 17 Feb 2017 21:41:47 GMT

### Patches

- Add logging to error UI when we fail to load a module via Require

## 20.0.2
Fri, 17 Feb 2017 00:22:24 GMT

### Patches

- minor ABExperiment name changes

## 20.0.1
Tue, 14 Feb 2017 22:52:20 GMT

### Patches

- Compress ODCInline bundle

## 20.0.0
Fri, 10 Feb 2017 23:47:08 GMT

### Breaking changes

- Strengthen type enforcement for Resources and rename some concepts

## 19.6.2
Thu, 09 Feb 2017 21:01:57 GMT

### Patches

- Added optional parameter in OdbBeacon to allow consumers of the class to specify a flush timeout.

## 19.6.1
Tue, 07 Feb 2017 04:07:09 GMT

### Patches

- Don't pass arguments object to function.apply

## 19.6.0
Wed, 01 Feb 2017 20:07:41 GMT

### Minor changes

- Add Trace event as the base for Verbose and CaughtError

## 19.5.0
Wed, 01 Feb 2017 01:33:29 GMT

### Minor changes

- Adding in killswitch utility

## 19.4.0
Wed, 01 Feb 2017 01:04:44 GMT

### Minor changes

- Make all fields of IFeature optional

## 19.3.0
Tue, 31 Jan 2017 21:46:10 GMT

### Minor changes

- Add support for loaders directly on Resource keys

## 19.2.2
Wed, 25 Jan 2017 19:52:15 GMT

### Patches

- Remove orphan Error Promises in loadAsync

## 19.2.1
Tue, 24 Jan 2017 08:16:17 GMT

### Patches

- Enable concurrent consumeAsync calls

## 19.2.0
Tue, 24 Jan 2017 00:27:51 GMT

### Minor changes

- Handle all constructor forms in Component.child

## 19.1.6
Sat, 21 Jan 2017 01:39:08 GMT

### Patches

- Add handling to Uri for "foo" query string

## 19.1.5
Thu, 19 Jan 2017 02:44:32 GMT

### Patches

- Fix StringHelper.format behavior

## 19.1.4
Wed, 18 Jan 2017 22:53:47 GMT

### Patches

- Add test coverage for AriaLoggerCore

## 19.1.3
Wed, 18 Jan 2017 19:27:40 GMT

### Patches

- Fix resource factory dependency ordering

## 19.1.2
Tue, 17 Jan 2017 22:00:54 GMT

### Patches

- Fix ARIA log field prefixing

## 19.1.1
Sat, 14 Jan 2017 01:20:36 GMT

### Patches

- Minor internal fixes

## 19.1.0
Tue, 10 Jan 2017 01:51:01 GMT

### Minor changes

- Fix issues identified by noUnusedLocals

## 19.0.0
Sat, 07 Jan 2017 09:24:27 GMT

### Breaking changes

- Removing some list utilities and moving them to odsp-datasources

### Patches

- Use 2.1 typings

## 18.0.0
Thu, 22 Dec 2016 07:51:50 GMT

### Breaking changes

- TypeScript 2.1

## 17.4.1
Thu, 22 Dec 2016 07:35:54 GMT

### Patches

- Revert dependency on TypeScript 2.1 Features

## 17.4.0
Wed, 21 Dec 2016 17:58:50 GMT

### Minor changes

- Add IconHelper utility class

## 17.3.0
Tue, 20 Dec 2016 00:21:25 GMT

### Minor changes

- Add Blob and Progress support for XHR

## 17.2.1
Mon, 19 Dec 2016 01:49:22 GMT

### Patches

- Stricter typings for Resources, Promise

## 17.2.0
Sat, 17 Dec 2016 05:32:03 GMT

### Minor changes

- Simplify logging event classes

