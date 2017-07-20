import { Killswitch } from '@ms/odsp-utilities/lib/killswitch/Killswitch';
import Features from '@ms/odsp-utilities/lib/features/Features';
import { DocumentType } from '@ms/odsp-datasources/lib/interfaces/list/DocumentType';
import { ICreateDocumentStrings } from './IAction';

const VisioDrawingCreation = { ODB: 973 };

export function getDialogTitle(docType: DocumentType, strings: ICreateDocumentStrings): string {
    let dialogTitle = '';
    switch (docType) {
        case DocumentType.Word:
            dialogTitle = strings.CreateWord;
            break;
        case DocumentType.Excel:
            dialogTitle = strings.CreateExcel;
            break;
        case DocumentType.PowerPoint:
            dialogTitle = strings.CreatePowerPoint;
            break;
        case DocumentType.OneNote:
            dialogTitle = strings.CreateOneNote;
            break;
        case DocumentType.ExcelSurvey:
            dialogTitle = strings.CreateExcelSurvey;
            break;
        case DocumentType.Text:
            dialogTitle = strings.CreateText;
            break;
        case DocumentType.ExcelForm:
            dialogTitle = strings.CreateFormForExcel;
            break;
        case DocumentType.Visio:
            if (!Killswitch.isActivated("D75200B0-4F07-464B-851E-AEB3CA8101F0", "06/18/2017", "KillSwitchVisioEditFakeLicense") ||
                Features.isFeatureEnabled(VisioDrawingCreation)) {
                dialogTitle = strings.CreateVisio;
            }
            break;
    }

    return dialogTitle;
}

export function getDocExtension(docType: DocumentType): string {
    switch (docType) {
        case DocumentType.Word:
            return '.docx';
        case DocumentType.Excel:
        case DocumentType.ExcelSurvey:
        case DocumentType.ExcelForm:
            return '.xlsx';
        case DocumentType.PowerPoint:
            return '.pptx';
        case DocumentType.OneNote:
            return '';
        case DocumentType.Text:
            return '.txt';
        case DocumentType.Visio:
            if (!Killswitch.isActivated("D75200B0-4F07-464B-851E-AEB3CA8101F0", "06/18/2017", "KillSwitchVisioEditFakeLicense") ||
                Features.isFeatureEnabled(VisioDrawingCreation)) {
                return '.vsdx';
            }
    }
}