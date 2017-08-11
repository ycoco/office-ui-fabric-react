import {
    getTheme
} from '@uifabric/styling/lib/styles/theme';
import { format } from '@ms/odsp-utilities/lib/string/StringHelper';
import Sanitize from '@ms/odsp-utilities/lib/encoding/Sanitize';


/**
 * Creates a style block that acts as a styling API. This API is made of themed CSS
 * classes, and useful in scenarios where content creators can only author HTML.
 * The naming scheme for the classes is:
 * sp-css-[property being styled]-[slot name used for property's value]
 * For example, if the bodyText slot is assigned the value #333333, these blocks
 * (among others) would be generated:
 * .sp-css-backgroundColor-bodyText { background-color: #333333; }
 * .sp-css-color-bodyText { color: #333333; }
 * .sp-css-borderColor-bodyText { border-color: #333333; }
 */
export function generateCssApi() {
    let theme = getTheme();

    const styleBlockId = 'spCssApi';
    let originalStyleBlock = <HTMLStyleElement>document.getElementById(styleBlockId);
    let styleBlock = originalStyleBlock || document.createElement("style");
    if (!originalStyleBlock) {
        styleBlock.type = 'text/css';
        styleBlock.id = styleBlockId;
    }

    const {
        bodyBackground,
        bodyText,
        bodySubtext,
        bodyDivider,
        disabledBackground,
        disabledText,
        disabledSubtext,
        errorBackground,
        errorText,
        listBackground,
        listTextColor,
        listItemBackgroundChecked
    } = theme.semanticColors;
    let standardSemanticSlots = {
        bodyBackground,
        bodyText,
        bodySubtext,
        bodyDivider,
        disabledBackground,
        disabledText,
        disabledSubtext,
        errorBackground,
        errorText,
        listBackground,
        listTextColor,
        listItemBackgroundChecked
    };

    const {
        themeDarker,
        themeDark,
        themeDarkAlt,
        themePrimary,
        themeSecondary,
        themeTertiary,
        themeLight,
        themeLighter,
        themeLighterAlt,
        black,
        neutralDark,
        neutralPrimary,
        neutralPrimaryAlt,
        neutralSecondary,
        neutralTertiary,
        neutralTertiaryAlt,
        neutralQuaternary,
        neutralQuaternaryAlt,
        neutralLight,
        neutralLighter,
        neutralLighterAlt,
        white
    } = theme.palette;
    let paletteSlots = {
        themeDarker,
        themeDark,
        themeDarkAlt,
        themePrimary,
        themeSecondary,
        themeTertiary,
        themeLight,
        themeLighter,
        themeLighterAlt,
        black,
        neutralDark,
        neutralPrimary,
        neutralPrimaryAlt,
        neutralSecondary,
        neutralTertiary,
        neutralTertiaryAlt,
        neutralQuaternary,
        neutralQuaternaryAlt,
        neutralLight,
        neutralLighter,
        neutralLighterAlt,
        white
    };

    let styles = '';
    let standardSlots = { ...standardSemanticSlots, ...paletteSlots };
    styles += _makeBlocks('.sp-css-backgroundColor-{0}', 'background-color', standardSlots);
    styles += _makeBlocks('.sp-css-color-{0}', 'color', standardSlots);
    styles += _makeBlocks('.sp-css-borderColor-{0}', 'border-color', standardSlots);

    styleBlock.innerHTML = styles;
    if (!originalStyleBlock) {
        document.head.appendChild(styleBlock);
    }

    /**
     * For each slot, makes a declaration block. That block has a selector following the template, and defines
     * only that property, whose value is the value of the slot.
     *
     * @private
     * @param {string} selectorTemplate The selector pattern. string.format() is called on it, replacing {0} with the slot name.
     * @param {string} property The style property to define.
     * @param {*} slotsToValues A map of slot names to strings, where the string is the value of the slot.
     * @returns a string that contains all generated blocks, one for each entry in slotsToValues.
     * @memberof GenerateCssApi
     */
    function _makeBlocks(
        selectorTemplate: string,
        property: string,
        slotsToValues: any
    ) {
        let toReturn = "";

        for (let slot in slotsToValues) {
            toReturn += format(selectorTemplate, slot) +
                '{' +
                property + ':' + Sanitize.getTextFromHtml(slotsToValues[slot]) +
                '}';
        }

        return toReturn;
    }

}

