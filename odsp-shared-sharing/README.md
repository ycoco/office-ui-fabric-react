## Contributing to the share UI

### Getting set up

**odsp-shared-sharing (the share UI repo)**
1. Clone this repo and create a new branch to get started.
2. Please refer to the **Building** section of `odsp-common`'s [README](https://onedrive.visualstudio.com/DefaultCollection/OneDriveWeb/_git/odsp-common?path=%2FREADME.md&version=GBmaster&_a=contents) for instructions on how to install *rush* and how to build `odsp-common`.
    * Note a full build is usually only required when you create a new branch. After that, you can run `npm run build` inside of the *odsp-shared-sharing* folder to incrementally build changes.

**odsp-next**
1. Clone `odsp-next` (repo found [here](https://onedrive.visualstudio.com/DefaultCollection/OneDriveWeb/_git/odsp-next)).
    * If you're only using `next` to test changes made in `odsp-shared-sharing`, you can just build master, otherwise, create yourself a branch.
2. Refer to `odsp-next`'s [README](https://onedrive.visualstudio.com/DefaultCollection/OneDriveWeb/_git/odsp-next?path=%2FREADME.md&version=GBjoem%2Fshare-ui-changes-sub&_a=contents) for pre-requesites. These include installing Git, gulp, and authentication for private `npm` packages. Ensure you get a good build (seeing dev links outputted in the console with no errors) before continuing!

### Linking the repos
1. Install `b-link`, a tool built specifically for this purpose, with `npm i -g @ms/b-link`.
2. Run `b-link` in either command prompt for your repos and follow the prompts.
    * Provide a shared parent folder and `b-link` will find your repos.
    * Select the `odsp-next` option and the `odsp-shared-sharing` option within the `odsp-common` folder, and then click 'Link`.
3. The repositories are now linked, so you can do a fresh build of `odsp-next` (use `gulp deploy --nolint --disable-cache`) and `next` will be using the built code from your `odsp-common` repo.

### Testing changes
1. Once you make changes in `odsp-shared-sharing`, build the project by running `npm run build` from within the directory. Let that finish (should be pretty quick after initial build) before going to the next step.
2. Next, run `gulp deploy --nolint` from within your `odsp-next` directory to get a set of dev links.
    * Note, as of 3/30 the new share UI flight is turned on by default in EDOG, so no further action is necessary. If you want to test in MSIT, you need to add *enableFeatures=884* to the query string.

> **Tip**: Create an alias to build both repos synchronously so you don't have to worry about it. Assuming your repos live in the same directory, you can use this alias (run it from *odsp-common/odsp-shared-sharing*): `npm run build; cd ../../odsp-next; gulp deploy --nolint; cd ../odsp-common/odsp-shared-sharing`. This will build `odsp-shared-sharing`, then switch to your `next` repo and build it, and then switch back to `odsp-shared-sharing` to bring you where you started. Super handy!