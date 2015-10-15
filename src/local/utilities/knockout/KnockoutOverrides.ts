import ko = require('knockout');

if (typeof ko.options.preferJQueryEvents === 'boolean') {
    ko.options.preferJQueryEvents = false;
} else if (typeof ko.options.useOnlyNativeEvents === 'boolean') {
    ko.options.useOnlyNativeEvents = true;
}
