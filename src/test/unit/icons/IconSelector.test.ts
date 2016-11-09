import { expect } from 'chai';
import * as IconSelector from '../../../odsp-utilities/icons/IconSelector';
import ItemType from '../../../odsp-utilities/icons/ItemType';

describe('IconSelector', () => {
    describe('getIconNameFromExtension', () => {
        it('works with dot', () => {
            var iconName: string = IconSelector.getIconNameFromExtension('.asp');

            expect(iconName).to.equal('code');
        });

        it('works without dot', () => {
            var iconName: string = IconSelector.getIconNameFromExtension('asp');

            expect(iconName).to.equal('code');
        });

        it('works with caps', () => {
            var iconName: string = IconSelector.getIconNameFromExtension('ASP');

            expect(iconName).to.equal('code');
        });

        it('works from item', () => {
            var iconName: string = IconSelector.getIconNameFromItem({ type: ItemType.Folder, isDocSet: true });

            expect(iconName).to.equal('docset');
        });

        it('works for type', () => {
            var type: ItemType = IconSelector.getItemTypeFromExtension('jpg');

            expect(type).to.equal(ItemType.Media);
        });
    });
});
