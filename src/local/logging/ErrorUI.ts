﻿// OneDrive:IgnoreCodeCoverage

/// <reference path='../debug/Debug.d.ts' />

import IClonedEvent = require("./IClonedEvent");
import { Manager } from "./Manager";
import { UnhandledError, IUnhandledErrorSingleSchema } from "./events/UnhandledError.event";
import { CaughtError, ICaughtErrorSingleSchema } from "./events/CaughtError.event";
import { QosError } from "./events/QosError.event";
import { RequireJSError, IRequireJSErrorSingleSchema } from "./events/RequireJSError.event";
import { ClonedEventType as ClonedEventTypeEnum } from "./EventBase";

/* tslint:disable:use-strict */

// Only use this code in debug mode
if (DEBUG) {
    var _displayedErrorCount = 0;
    var _uiContainerEl;
    var /* @type(Boolean) */ _isInitialized;

    var c_EncodeHtmlRegEx = /[^\w .,-]/g;

    /**
     * Gets the char code from str at idx.
     * Supports Secondary-Multilingual-Plane Unicode characters (SMP), e.g. codes above 0x10000
     * @param String to get char code from
     * @param Index of char to get code for
     * @param Receives result code c: and index skip s: info
     * @returns True if this method processed the char code
     */
    function extendedCharCodeAt(str: string, idx: number, result: any) {
        var skip = (result.s === idx);
        if (!skip) {
            idx = idx || 0;
            var code = str.charCodeAt(idx);
            var hi, low;
            result.s = -1;
            if (code < 0xD800 || code > 0xDFFF) {
                //Main case, Basic-Multilingual-Plane (BMP) code points.
                result.c = code;
            } else if (code <= 0xDBFF) {
                // High surrogate of SMP

                hi = code;
                low = str.charCodeAt(idx + 1);
                result.c = ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
                result.s = idx + 1;
            } else {
                // Low surrogate of SMP, 0xDC00 <= code && code <= 0xDFFF

                //Shouldn't really ever come in here, previous call to this method would set skip index in result
                //in high surrogate case, which is short-circuited at the start of this function.
                result.c = -1;
                skip = true;
            }
        }
        return !skip;
    }

    /**
     * Aggressively encodes a string to be displayed in the browser. All non-letter characters are converted
     * to their Unicode entity ref, e.g. &#65;, period, space, comma, and dash are left un-encoded as well.
     * Usage: _divElement.innerHTML =_someValue.encodeHtml());
     * @return Encode Xml/Html
     */
    function encodeHtml(str: string) {
        var /* @dynamic */charCodeResult = {
            c: 0, // Code
            s: -1 // Next skip index
        };

        return str.replace(c_EncodeHtmlRegEx, function(match: string, ind: number, s: string) {
            if (extendedCharCodeAt(s, ind, charCodeResult)) {
                return ["&#", charCodeResult.c, ";"].join("");
            }
            //If extendedCharCodeAt returns false that means this index is the low surrogate,
            //which has already been processed, so we remove it by returning an empty string.
            return "";
        });
    };

    function addEventListener(el: HTMLElement, eventName: string, callback: (ev: any) => void) {
        if (el.addEventListener) {
            /* tslint:disable:ban-native-functions */
            el.addEventListener(eventName, callback);
            /* tslint:enable:ban-native-functions */
        } else {
            el['attachEvent']('on' + eventName, callback);
        }
    }

    /**
     * Initialize the error displaying UI
     */
    function initUI() {
        if (!_isInitialized) {
            // Create the _uiContainerEl for our error displaying UI
            _uiContainerEl = document.createElement("div");
            _uiContainerEl.id = "c_watsonui";
            _uiContainerEl.className = "selectable";
            _uiContainerEl.style.display = "none";
            document.body.insertBefore(_uiContainerEl, document.body.firstChild);

            // Style the container
            _uiContainerEl.style.position = "absolute";
            _uiContainerEl.style.width = "100%";
            _uiContainerEl.style.backgroundColor = "#FFFFD0";
            _uiContainerEl.style.zIndex = 3000000;
            _uiContainerEl.style.opacity = .85;
            _uiContainerEl.style.filter = 'alpha(opacity=85)';

            _isInitialized = true;
        }
    }

    /**
     * Given information about the error from Watson, show a UI that displays it all
     * @param The error code of the Error
     * @param The error message
     * @param The URL to the JS file or the current page, whichever was available
     * @param The line number in the JS file that the error occurred on
     * @param The host name of the current page
     * @param The function that was called just before the error occurred
     * @param The call stack, as a pre-formatted string.
     * @param Actions a user performed on the page, as a pre-formatted string
     * @param Any additional data that the caller into Watson provided
     */
    function showErrorUI(message: string, jsUrl: string, jsLine: number, jsCol: number, stackStr: string) {
        // Make sure the container div exists
        initUI();

        // Create the DOM elements that will display the UI
        var errorContainerEl = document.createElement("div");
        var closeButtonEl = document.createElement("a");
        var closeAllButtonEl = document.createElement("a");
        var formattedErrorEl = document.createElement("div");

        // Format all our data into HTML
        var formattedError = convertDataToHtml("Message", message)
            + convertDataToHtml("Url", jsUrl)
            + convertDataToHtml("Line", jsLine)
            + convertDataToHtml("Column", jsCol)
            + convertFormattedDataToHtml("Stack", stackStr);
        formattedErrorEl.innerHTML = formattedError;

        // Style them, we don't want to add this css to a normal CSS file since it is only needed in INT environments
        closeButtonEl.style.fontWeight = "bold";
        closeButtonEl.innerText = closeButtonEl.textContent = "Close";
        errorContainerEl.style.borderBottom = "1px solid black";
        errorContainerEl.style.padding = "15px";

        closeAllButtonEl.style.fontWeight = "bold";
        closeAllButtonEl.innerText = closeAllButtonEl.textContent = " or Close All";

        // Add the elements to the document
        _uiContainerEl.appendChild(errorContainerEl);
        errorContainerEl.appendChild(closeButtonEl);
        errorContainerEl.appendChild(closeAllButtonEl);

        errorContainerEl.appendChild(formattedErrorEl);

        // Make sure the parent container is visible
        _uiContainerEl.style.display = "block";

        // Wire up the 'close' and 'close all' buttons
        /* tslint:disable:ban-native-functions */
        addEventListener(closeButtonEl, "click", dismissErrorUI);
        addEventListener(closeAllButtonEl, "click", dismissAllErrorUI);
        /* tslint:enable:ban-native-functions */

        _displayedErrorCount++;
    }

    /**
     * Takes a name/value pair and returns the appropriate markup to show it in our error ui
     * @param The label for the data we are going to show
     * @param The data to show
     * @return Html string that will display the data and a label for it
     */
    function convertDataToHtml(label: string, data: any) {
        return data ? "<div>" + formatLabel(label) + encodeHtml(data.toString()) + "</div>" : "";
    }

    /**
     * Takes a name/value pair and returns the appropriate markup to show it in our error ui
     * The value should be pre-formatted (\n line breaks)
     * @param The label for the data we are going to show
     * @param The data to show, pre-formatted
     * @return Html string that will display the pre-formatted data and a label for it
     */
    function convertFormattedDataToHtml(label: string, formattedData: any) {
        return formattedData ? "<div>" + formatLabel(label) + "<pre style='white-space: normal;'>" + encodeHtml(formattedData.toString()) + "</pre></div>" : "";
    }

    /**
     * Formats a label for our UI, and returns the appropriate markup to show it in our error UI
     * @param The label to format
     * @return Html string that will display the name (bold font)
     */
    function formatLabel(label: string) {
        return label ? "<span style='font-weight: bold;'>" + encodeHtml(label.toString()) + ":</span> " : "";
    }

    /**
     * Dismisses the given error message
     */
    function dismissErrorUI(ev: any) {
        // Remove this error's UI from the main error container
        var singleErrorContainer = ev.target.parentNode;
        _uiContainerEl.removeChild(singleErrorContainer);

        // If we removed the only message, hide the main container as well
        _displayedErrorCount--;
        if (_displayedErrorCount === 0) {
            _uiContainerEl.style.display = "none";
        }
    }

    /**
     * Dismisses all the error messages
     */
    function dismissAllErrorUI(ev: any) {
        if (_uiContainerEl) {
            _uiContainerEl.innerHTML = ''; // Dont worry about event clean up since these are debug dialogs
        }

        _displayedErrorCount = 0;
        _uiContainerEl.style.display = "none";
    }

    // Wire up the error handlers
    Manager.addLogHandler((event: IClonedEvent) => {
        if (event.eventType === ClonedEventTypeEnum.Single) {
            if (UnhandledError.isTypeOf(event)) {
                var unHandledData = <IUnhandledErrorSingleSchema>event.data;
                showErrorUI(unHandledData.message,
                    unHandledData.url,
                    unHandledData.line,
                    unHandledData.col,
                    unHandledData.stack);
            } else if (CaughtError.isTypeOf(event) && !QosError.isTypeOf(event)) {
                var caughtdata = <ICaughtErrorSingleSchema>event.data;
                showErrorUI(caughtdata.message, null, null, null, caughtdata.stack);
            } else if (RequireJSError.isTypeOf(event)) {
                var requireJSdata = <IRequireJSErrorSingleSchema>event.data;
                showErrorUI(requireJSdata.message, null, null, null, requireJSdata.stack);
            }
        }
    });
}