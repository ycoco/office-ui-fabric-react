import { IContextualMenuItem } from 'office-ui-fabric-react';

/**
 * This interface represents a command that can appear in the top level command bar
 * of the list web part.
 * 
 * A command may or may not be associated with an action (such as RenameAction).
 */
export interface ICommand {
    /**
     * Whether or not the command should be visible in the top command bar.
     */
    isVisible(): boolean;

    /**
     * Returns a representation of this command as an IContextualMenuItem.
     */
    getContextualMenuItem(): IContextualMenuItem;
}
