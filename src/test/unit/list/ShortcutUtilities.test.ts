import { assert } from 'chai';

import ShortcutUtilities from '../../../odsp-utilities/list/ShortcutUtilities';

describe("ShortcutUtilities", () => {
    it("identifies shortcut file types", () => {
        assert(ShortcutUtilities.isShortcutFileType("url"), "url is a shortcut file type");
        assert(ShortcutUtilities.isShortcutFileType("website"), "website is a shortcut file type");
        assert(!ShortcutUtilities.isShortcutFileType(".url"), ".url is a shortcut extension, not a file type");
        assert(!ShortcutUtilities.isShortcutFileType(".website"), ".website is a shortcut extension, not a file type");
    });

    it("identifies shortcut items", () => {
        assert(ShortcutUtilities.isShortcutItem({ key: '', extension: ".url" }), ".url is a shortcut extension");
        assert(ShortcutUtilities.isShortcutItem({ key: '', extension: ".website" }), ".website is a shortcut extension");
    });
});
