/// <summary>
/// DOM utilities, including helpers for injecting styles, creating elements, toggling classes.
/// </summary>
var TEXT_SETTING_METHOD;

import Rectangle = require('../math/Rectangle');
import PlatformDetection = require('../browser/PlatformDetection');

class DomUtils {
    public static MAX_STYLE_CONTENT_SIZE = 10000;
    public static SHADOW_PARENT_KEY = '_OneDrive_shadowParent';

    private static _platform = new PlatformDetection();
    private static _lastStyleElement: HTMLStyleElement = null;
    private static _styleText: string = "";

    public static hasClass(element: HTMLElement, className: string): boolean {
        if (element.classList) {
            return element.classList.contains(className);
        } else {
            var classList = element.className ? element.className.split(' ') : [];
            return classList.indexOf(className) !== -1;
        }
    }

    public static toggleClass(element: HTMLElement, className: string, isEnabled: boolean) {
        if (element.classList) {
            if (isEnabled) {
                element.classList.add(className);
            } else {
                element.classList.remove(className);
            }
        } else { // for IE9
            var classList = element.className ? element.className.split(' ') : [];
            var index = classList.indexOf(className);

            if (isEnabled) {
                if (index === -1) {
                    classList.push(className);
                }
            } else if (index > -1) {
                classList.splice(index, 1);
            }

            element.className = classList.join(' ');
        }
    }

    public static loadStyles(rules: string) {
        DomUtils._platform.isUnlimitedStyleSheetsSupported ? DomUtils.registerStyle(rules) : DomUtils.registerStyleIE(rules);
    }

    /**
     * Registers a set of style text. If it is registered too early, we will register it when the window.load event is fired.
     * @param {string} styleText Style to register.
     */
    public static registerStyle(styleText: string): void {
        var head = document.getElementsByTagName('head')[0];
        var styleElement = document.createElement("style");

        styleElement.type = "text/css";
        styleElement.appendChild(document.createTextNode(styleText));
        head.appendChild(styleElement);
    }

    /**
     * Registers a set of style text, for IE 9 and below, which has a ~30 style element limit so we need to register slightly differently.
     * @param {string} styleText Style to register.
     */
    public static registerStyleIE(styleText: string) {
        var head = document.getElementsByTagName('head')[0];
        var lastStyleContent = !!DomUtils._lastStyleElement ? DomUtils._lastStyleElement['styleSheet']['cssText'] : "";

        if (!DomUtils._lastStyleElement || (lastStyleContent.length + DomUtils._styleText.length) > DomUtils.MAX_STYLE_CONTENT_SIZE) {
            DomUtils._lastStyleElement = document.createElement("style");
            DomUtils._lastStyleElement.type = "text/css";
            head.appendChild(DomUtils._lastStyleElement);
        }

        DomUtils._lastStyleElement['styleSheet']['cssText'] += styleText;
    }

    public static loadStylesheet(url: string) {
        var element = document.createElement('link');
        element.rel = "stylesheet";
        element.type = "text/css";
        element.href = url;
        document.head.appendChild(element);
    }

    public static setText(el: HTMLElement, text: string) {
        if (TEXT_SETTING_METHOD === undefined) {
            TEXT_SETTING_METHOD = (DomUtils.ce('div').textContent !== void (0)) ? 'textContent' : 'innerText';
        }

        el[TEXT_SETTING_METHOD] = text;
    }

    public static ce(tagName: string, attributes?: { [key: string]: string }, children?: Node[]): HTMLElement {
        var el = document.createElement(tagName);

        if (attributes) {
            var attributeKeys = Object.keys(attributes);
            for (var i = 0; i < attributeKeys.length; i++) {
                var attribute = attributeKeys[i];
                el.setAttribute(attribute, attributes[attribute]);
            }
        }

        if (children) {
            for (var j = 0; j < children.length; j++) {
                el.appendChild(children[j]);
            }
        }

        return el;
    }


    public static ct(val: string): Text {
        return document.createTextNode(val);
    }

    public static createComment(value: string): Comment {
        return document.createComment(value);
    }

    public static insertAfter(newChild: Node, sibling: Node) {
        var parent = sibling.parentNode;
        var next = sibling.nextSibling;
        if (next) {
            // IE and Chrome do not like undefined for refChild
            parent.insertBefore(newChild, next);
        } else {
            parent.appendChild(newChild);
        }
    }

    /**
     * Calculates the minimum Rectangle that includes this element. Coordinates are relative to the viewport and
     * take into account the element border, padding, and optionally the margins.
     */
    public static calculateRect(element: HTMLElement, includeMargins?: boolean): Rectangle {
        var domRect = element.getBoundingClientRect();
        if (includeMargins) {
            var style = window.getComputedStyle(element);
            var marginLeft = parseFloat(style.getPropertyValue('margin-left'));
            var marginRight = parseFloat(style.getPropertyValue('margin-right'));
            var marginTop = parseFloat(style.getPropertyValue('margin-top'));
            var marginBottom = parseFloat(style.getPropertyValue('margin-bottom'));

            domRect.left -= marginLeft;
            domRect.top -= marginTop;
            domRect.width += marginLeft + marginRight;
            domRect.height += marginTop + marginBottom;
        }
        return new Rectangle(domRect.left, domRect.top, domRect.width, domRect.height);
    }

    /**
     * Calculates the minimum Rectangle that includes this element and all its descendant elements. Coordinates are relative to the viewport.
     */
    public static calculateSubtreeRect(element: HTMLElement): Rectangle {
        var result = null;

        var stack = [ element ];
        while (stack.length > 0) {
            element = stack.shift();
            var elementRect = DomUtils.calculateRect(element);

            // exclude zero width/height elements
            if ((elementRect.width > 0) && (elementRect.height > 0)) {
                if (result) {
                    result = result.union(elementRect);
                } else {
                    result = elementRect;
                }
            }

            for (var i = 0, len = element.children.length; i < len; i++) {
                stack.push(<HTMLElement>element.children[i]);
            }
        }

        if (!result) {
            result = new Rectangle();
        }

        return result;
    }

    /* todo: verify this works and use in OverlayHostViewModel
      Calculates the offset FROM the first element TO the second. The returned Rectangle's
      left/top/right/bottom gives the offset for each of the four sides that can be added
      to the first element's offsets to get to the second.
     
    public static calculateOffsetRect(from: HTMLElement, to: HTMLElement): Rectangle {
        var fromRect = from.getBoundingClientRect();
        var toRect = to.getBoundingClientRect();

        var left = toRect.left - fromRect.left;
        var top = toRect.top - fromRect.top;

        return new Rectangle(
            left,
            top,
            -(left - (toRect.right - fromRect.right)), // width
            -(top - (toRect.bottom - fromRect.bottom))); // height
    }*/
}

export = DomUtils;