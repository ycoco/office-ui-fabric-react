// OneDrive:IgnoreCodeCoverage

interface IItemActivity {
    getKey(): string,
    getTitle(): React.ReactNode[] | JSX.Element | string;
    getDescription(): React.ReactNode[] | JSX.Element | string;
    getIconName(): string;
    getDate(): Date;
}

export default IItemActivity;