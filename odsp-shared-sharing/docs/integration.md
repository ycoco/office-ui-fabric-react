# Integrating ODSP Sharing UI

Currently, there are 2 supported paths (iframe or WebView) to integrate the ODSP sharing UI into partner applications. Depending on which path you use, *how* your app communicates with the sharing UI will differ, but the interface is the same. This document aims to get partners up and running with this shared experience.


## Step-by-step instructions

1. Host frames (via an iframe or a WebView) the sharing UI microservice URL, and should show their own loading UI while the page downloads and the UI is constructed.
    - Production URL: *https://admin.onedrive.com/share*
    - Dogfood URL: *https://www.onedrive-tst.com/share*
2. Host provides a context object (reference [`ISharingContextInformation`](../src/interfaces/ISharingContextInformation.ts)) so the UI can render.
    - If using an iframe, provide this information via a JSON-stringfied string in a POST request of the microservice URL.
    - If using a WebView, your app must expose a JavaScript function (via `window.external`) called `GetSharingContextInformation` that returns the context object as a JSON object or JSON-stringified string.
3. Host listens for a "ready" event from the UI, and then proceeds to dismiss loading UI and show the sharing UI.
    - If using an iframe, listen for a "share_ready" POST message.
    - If using a WebView, implement a `PageFinishedLoading` function.

## Host-client Interface

### WebView implementation (`window.external`)
* `GetSharingContextInformation(): ISharingContextInformation | string`
    - Returns an object that implements [`ISharingContextInformation`](../src/interfaces/ISharingContextInformation.ts) or a JSON-stringified string version of it.
* `PageFinishedLoading()`
    - Called when sharing UI has fully rendered. When called, hosts should hide their loading UI and make the sharing UI visible.
* `Resize(width: number, height: number)`
    - Called when host should resize the UI.
* `CopyToClipboard(sharingLinkUrl: string)`
    - *Optional*
    - The UI attempts to use web APIs to copy the sharing link to the user's clipboard when it can; however, if it fails, it'll fall back to calling this function so the host can attempt.
* `IsSendCopyEnabled(): boolean`
    - *Optional (default is false)*
    - UI will provide a "Send a copy" option for the current item being shared if this function returns `true`.
* `SendCopy()`
    - *Optional*
    - This function is a callback so the host can take over to a send a copy of the item instead of a sharing link.
* `IsSendPDFEnabled(): boolean`
    - *Optional (default is false)*
    - UI will provide a "Send as PDF" option for the current item being shared if this function returns `true`.
* `SendPDF()`
    - *Optional*
    - This function is a callback so the host can take over to a send a PDF of the item instead of a sharing link.

### IFrame implementation (`postMessage`)

Post messages are sent as a JSON-stringified object with simple properties. All messages will have a `name` property that describes the event (i.e. "share_ready"). Messages may include other properties which will be documented in this section.

*Note: At time of writing, the full interface hasn't been implemented for iframe implementation. If required, please reach out to joem.*

* `share_ready`
    - Dispatched when sharing UI has fully rendered. When received, hosts should hide their loading UI and make the sharing UI visible.
* `share_resize`
    - Dispatched when host should resize the UI.
    - Additional properties include `width` and `height`.
