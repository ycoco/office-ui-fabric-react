// This file defines the special adapter interfaces that the modern ListView application uses
// to invoke SPFx client-side extensions.  These "adapters" are used instead of the real types
// because the ListView was not built using the SystemJS/WebPack toolchain.  These adapters
// would not be needed for applications built on the SPFx platform (e.g. sp-pages);
// instead, they can directly implement the "accessor" contracts.

/**
 * This interface should be implemented by the ListView application.
 * It provides both SPField data, as well as column presentation information.
 */
export interface IColumn {
  // Example: "48b53d82-711d-44b4-8419-4c1be898663b"
  id: string;

  // Example: "Source_x0020_File"
  internalName: string;

  // Example:  "Text"
  fieldType: string;

  // Example: true
  isRequired: boolean;

  // Example: true
  isVisible: boolean;

  // Example: "Source File"
  displayName: string;

  // Example: "eb8acb99-b025-4d1f-839e-305b79cddcde"
  clientSideComponentId: string;

  // Example: '{ "doSomething": true }'
  clientSideComponentProperties: string;

  /**
   * This allows the client-side extension to specify whether the column should be visible or not.
   * It will only be called during BaseFieldCustomizer.onInit().
   */
  onSetVisible(visible: boolean): void;

  /**
   * This is called by loadFieldCustomizers(), only if an an error occured
   * when loading the associated field customizer.
   */
  onFieldCustomizerError(error: Error): void;
}

/**
 * This object is provided by the SPFx host, obtained via IListViewAdapter.createColumnAdapter().
 * It represents a column shown by the ListView.
 */
export interface IColumnAdapter {
  /**
   * Returns the IListViewAdapter object that this column belongs to.
   */
  readonly listViewAdapter: IListViewAdapter;

  /**
   * True if the application should call renderCell()
   */
  readonly fieldCustomizerLoaded: boolean;

  /**
   * Attempts to render the cell using the field customizer.  If there is no associated
   * field customizer, or if the field customizer failed to render (i.e. the
   * onFieldCustomizerError callback was called), then renderCell() returns undefined.
   * Otherwise, it returns an ICellAdapter instance.  If the developer's code throws
   * an exception, it will be trapped and reported via ICellAdapter.error.
   *
   * NOTE: If an ICellAdapter object is returned, the application MUST call ICellAdapter.dispose().
   */
  renderCell(row: IRowAdapter, cellDiv: HTMLDivElement): ICellAdapter | undefined;
}

/**
 * This interface should be implemented by the ListView application.
 * It represents the SPListItem being rendered by the ListView.
 */
export interface IRow {
  /**
   * A map of column values for the row. They key is the column internal name and the value
   * is its corresponding value in the row.
   */
  values: { [columnInternalName: string]: any }; // tslint:disable-line:no-any
}

/**
 * This object is provided by the SPFx host, obtained via IListViewAdapter.createRowAdapter().
 * It stores the SPListItem displayed by the ListView.
 */
export interface IRowAdapter {
}

/**
 * This object is provided by the SPFx host, as returned by IColumnAdapter.renderCell().
 * It tracks the lifecycle of a cell that was rendered, to ensure resources are freed properly
 * when the cell Div is removed from the DOM.
 */
export interface ICellAdapter {
  readonly error: Error;
  readonly cellDiv: HTMLDivElement;

  /**
   * Dispose any resources that were associated with the cellDiv that was rendered.
   */
  dispose(): void;
}

/**
 * This object is provided by the SPFx host, as returned by ICommandSetAdapter.queryCommands().
 * It represents a command that can be displayed by the UI, e.g. a menu item or command bar button.
 * Note that the properties of the ICommandAdapter may change when refresh() is called.
 */
export interface ICommandAdapter {
  /**
   * The unique identifier for the command.  This is specified as ICommandDefinition.commandId
   * in the component manifest.
   * Example: "START_AUDIT"
   */
  commandId: string;

  /**
   * Whether the command should be displayed at all.
   * NOTE: The value of this property may change when refresh() is called.
   * Example: "Audit these 3 documents"
   */
  visible: boolean;

  /**
   * The label shown by the menu item or button.
   * NOTE: The value of this property may change when refresh() is called.
   * Example: "Audit these 3 documents"
   */
  title: string;

  /**
   * An informational description that my be shown e.g. as a tool tip, if the UI
   * supports it.
   */
  description: string;

  /**
   * The aria label of the button for the benefit of screen readers.
   */
  ariaLabel: string;

  /**
   * Requests for the ICommandAdapter to update its state based on the new context.
   * For the right-click context menu, the application should call refresh() for each
   * command whenever it renders the menu.  For the command bar buttons, the application
   * should call refresh() whenever the selection changes.
   */
  refresh(selectedRows: ReadonlyArray<IRowAdapter>): void;

  /**
   * If the menu item is clicked, the application should call this method to perform
   * the custom operation.
   */
  execute(): void;
}

/**
 * This object is provided by the SPFx host, obtained via ICommandSetAdapter.loadCommandSet().
 * It represents a client-side extension that defines one or more commands.
 */
export interface ICommandSetAdapter {
  /**
   * This returns the list of commands, as defined in the client-side manifest.
   * The state of the individual commands may change, but the array itself has a fixed
   * length.
   */
  readonly commandAdapters: ReadonlyArray<ICommandAdapter>;
}

/**
 * This object is provided by the SPFx host, obtained via ISpfxAdapter.createListViewAdapter().
 * It corresponds to an instance of the ListView, and ensures that all SPFx resources are
 * disposed properly when the ListView is disposed.
 */
export interface IListViewAdapter {
  /**
   * The columns that were added to this ListView by calling addColumnAdapter().
   */
  readonly columnAdapters: ReadonlyArray<IColumnAdapter>;

  /**
   * Creates a new IColumnAdapter object and adds it to the columns for this ListView.
   * The column will be disposed by IListViewAdapter.dispose().
   *
   * NOTE: This will throw a validation exception if the IColumn is missing required data.
   */
  addColumnAdapter(column: IColumn): IColumnAdapter;

  /**
   * Creates a new IRowAdapter associated with this ListView.  Note that the IListViewAdapter
   * itself does not keep track of rows, since it assumes they might be part of a complicated
   * virtual scrolling surface.
   *
   * NOTE: This will throw a validation exception if the IColumn is missing required data.
   */
  createRowAdapter(row: IRow): IRowAdapter;

  /**
   * After all the columns have been created, the application should call loadFieldCustomizers()
   * before it begins rendering.  The promise will resolve after all of the field loadFieldCustomizers
   * have been loaded and initialized.
   *
   * NOTE: This promise will never reject, so there is no need for a "catch" handler.
   * If errors occur, they will be reported via the onFieldCustomizerError() callback.
   */
  loadFieldCustomizers(): Promise<void>;

  /**
   * Loads a CommandSet client-side extension, using this ListView as its context.
   *
   * NOTE: If the component fails to load, then the promise will reject.  Thus, the application
   * must attach a "catch" handler.
   */
  loadCommandSet(clientSideComponentId: string, clientSideComponentProperties: string): Promise<ICommandSetAdapter>;

  /**
   * Dispose all resources (e.g. field customizer instances) associated with this adapter.
   */
  dispose(): void;
}

/**
 * This object is provided by the SPFx host, obtained via IListViewSpfxHostApplication.adapter.
 * It is the top-level entry point for extensiblity.
 */
export interface ISpfxAdapter {
  /**
   * Creates a new extensibility adapter associated with a ListView.
   * NOTE: To avoid resource leaks, the application MUST call IListViewAdapter.dispose()
   * if the ListView is disposed.
   */
  createListViewAdapter(): IListViewAdapter;
}

/**
 * This interface describes the client-side application object for "@ms/listview-spfx-host",
 * as returned by the sp-loader.
 */
export interface IListViewSpfxHostApplication {
  adapter: ISpfxAdapter;
}
