# odsp-shared-react

## Setup prereq

* NPM v3.10.8 or later (npm install -g npm@^3.10.8)
* Gulp (npm install -g gulp)

#### Private NPM access instructions
**Email dzearing@microsoft.com if you have issues**
**NOTE:** this assumes that you have installed NPM and can access it on the command line. These

Private packages are not stored in public npm, but install in our internal artifactory instance. Private packages are scoped using @ms/ prefix, you will see this in import statements as well as in package.json dependency lists. (e.g. import '@ms/odsp-utilities')

In order to use private NPM modules, your .npmrc file needs to be able to resolve the @ms scope to the right artifactory (private npm repository) url with the right auth key. Follow these steps to get that set up:

1. Set up an artifactory password here: https://msblox.azurewebsites.net/Profile
2. Go to this url:
  1. [http://cxovm01.cloudapp.net/artifactory/webapp/#/artifacts/browse/tree/General/**npm-virtual**](http://cxovm01.cloudapp.net/artifactory/webapp/#/artifacts/browse/tree/General/npm-virtual)
  2. NOTE if you are publishing packages and not just downloading them, use this URL instead (replace "virtual" with "local"):
  3. [http://cxovm01.cloudapp.net/artifactory/webapp/#/artifacts/browse/tree/General/**npm-local**](http://cxovm01.cloudapp.net/artifactory/webapp/#/artifacts/browse/tree/General/npm-local)
  4. It may prompt you for a username/password. Click “SSO login”
3. Once signed in, click your username in top right to go to profile, enter password, expose the API key. Copy the API key.
4. Ensure you have the "curl" utility available at command line. Mac users should have the "curl" tool available by default, but Windows users may need to install it from here:
  1. [http://www.confusedbycode.com/curl/](http://www.confusedbycode.com/curl/)
5. On the command line, run curl to get your npm settings. Replace the username with your email (dzearing@microsoft.com) and use the api key previously copied. NOTE that there is no space between the -u and username.

```
curl -i -u<username>:<api key> http://cxovm01.cloudapp.net/artifactory/api/npm/npm-virtual/auth/ms
```

**NOTE:** again if you're publishing packages, you will need to replace "virtual" above with "local"

This should return something like:
```
@ms:registry=http://cxovm01.cloudapp.net/artifactory/api/npm/npm-virtual/
//cxovm01.cloudapp.net/artifactory/api/npm/npm-virtual/:_password=XXXCYmN5d3VMamZ5eG9nREd5Y1Z0aGVlbmRn
//cxovm01.cloudapp.net/artifactory/api/npm/npm-virtual/:username=dzearing@microsoft.com
//cxovm01.cloudapp.net/artifactory/api/npm/npm-virtual/:email=dzearing@microsoft.com
//cxovm01.cloudapp.net/artifactory/api/npm/npm-virtual/:always-auth=true
```

You need to copy this and add it to your global .npmrc:
```
Windows:
                C:\Users\<username>\.npmrc
Mac:
                ~/.npmrc
```

Now install the SPPPLAT:

```
npm install @ms/sppplat@0.0.4
```

## Setup

`npm install`

## Common tasks

* `gulp serve` to see the demo app. **Any new component you write should be added to the demo app.**

## Publishing a new version

* Please talk to someone in the [Version Bumpers](https://onedrive.visualstudio.com/OneDriveWeb/Version%20Bumpers/_admin) VSO group to help you publish a new version, for now.

## About Shrinkwrap / Updating package's dependencies (aka version bump dependencies)

If you need to update odsp-shared-react's npm dependencies, do the following.

*If package.json is already valid and you just need a new version:*
1. Run `gulp generate`.

*If package.json is not valid and you need to make a change there:*

1. Make the change in package.json (example: if dependency was `^0.3.0` and you need 0.4.0, which `^0.3.0` does not satisfy, change it to `>=0.4.0 <1.0.0`)
2. (Optional but strongly recommended, especially if you have not done this step for a long time) Delete your node_modules folder
3. (Optional but strongly recommended) Run npm install
4. Run gulp generate
