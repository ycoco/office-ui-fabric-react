import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/index';
import { IShareStrings, ClientId } from '../interfaces/SharingInterfaces';

module AttachAsCopyHelper {
    /**
     * This function returns available "Attach as Copy" options for use
     * when the UI is hosted by native Office clients.
     *
     * @param clientId The clientId of the hosting application.
     */
    export function getAttachAsCopyOptions(clientId: ClientId, strings: IShareStrings): Array<IContextualMenuItem> {
        const options = [];

        // Get document option (i.e. Word, Excel, PowerPoint) and add if available.
        const documentOption = _getDocumentOption(clientId, strings);
        if (documentOption) {
            options.push(documentOption);
        }

        // Get PDF option and add if available.
        const pdfOption = _getPdfOption(strings);
        if (pdfOption) {
            options.push(pdfOption);
        }

        return options;
    }

    function _getDocumentOption(clientId: ClientId, strings: IShareStrings): IContextualMenuItem {
        let isDocumentOptionAvailable = false;

        // Determine if attaching as document is supported.
        try {
            const externalJavaScript: any = window.external;
            isDocumentOptionAvailable = externalJavaScript.IsSendCopyEnabled();
        } catch (error) {
            // Nothing.
        }

        // If unavailable, just return.
        if (!isDocumentOptionAvailable) {
            return undefined;
        }

        // Return appropriate option based on clientId.
        if (clientId === ClientId.word) {
            return {
                key: 'word',
                name: strings.wordDocument,
                iconProps: { iconName: 'WordDocument' },
                onClick: _externalSendCopy
            };
        } else if (clientId === ClientId.powerpoint) {
            return {
                key: 'powerpoint',
                name: strings.powerPointPresentation,
                iconProps: { iconName: 'PowerPointDocument' },
                onClick: _externalSendCopy
            };
        } else if (clientId === ClientId.excel) {
            return {
                key: 'excel',
                name: strings.excelWorkbook,
                iconProps: { iconName: 'ExcelDocument' },
                onClick: _externalSendCopy
            };
        } else if (clientId === ClientId.visio) {
            return {
                key: 'visio',
                name: strings.visioDrawing,
                iconProps: { iconName: 'VisioLogo' },
                onClick: _externalSendCopy
            };
        } else {
            return {
                key: 'document',
                name: strings.document,
                iconProps: { iconName: 'Document' },
                onClick: _externalSendCopy
            };
        }
    }

    function _getPdfOption(strings: IShareStrings): IContextualMenuItem {
        let isPdfOptionAvailable = false;

        // Determine if attaching as PDF is supported.
        try {
            const externalJavaScript: any = window.external;
            isPdfOptionAvailable = externalJavaScript.IsSendPdfEnabled();
        } catch (error) {
            // Nothing.
        }

        // If unavailable, just return.
        if (!isPdfOptionAvailable) {
            return undefined;
        }

        return {
            key: 'pdf',
            name: strings.pdf,
            iconProps: { iconName: 'PDF' },
            onClick: _externalSendPdf
        };
    }

    function _externalSendCopy() {
        try {
            const externalJavaScript: any = window.external;
            externalJavaScript.SendCopy();
        } catch (error) {
            // Nothing.
        }
    }

    function _externalSendPdf() {
        try {
            const externalJavaScript: any = window.external;
            externalJavaScript.SendPdf();
        } catch (error) {
            // Nothing.
        }
    }
}

export default AttachAsCopyHelper;