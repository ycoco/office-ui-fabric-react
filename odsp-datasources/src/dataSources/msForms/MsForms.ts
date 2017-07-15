import ISpPageContext from '../../interfaces/ISpPageContext';

// All the hash parameters will be encoded as the value of "Fragment" paramter.
const EDogFormHost = "forms.officeppe.com";
const DefaultFormHost = "forms.office.com";
const EditActionString = "&action=edit";

export function GetCreateFormUrl(pageContext: ISpPageContext, editLink: string, docName: string): string {
    let workbookId = editLink.replace(EditActionString, "");
    let hostName = pageContext.env.toLowerCase() === "edog" ? EDogFormHost : DefaultFormHost;

    let hashString = `Action=Create&Host=OneDrive&XlWorkbookId=${
        encodeURIComponent(workbookId)
    }&Title=${
        encodeURIComponent(docName)
    }`;
    let url = `https://${
        hostName
    }/Pages/DesignPage.aspx?Action=Create&Fragment=${
        encodeURIComponent(hashString)
    }`;
    return url;
}
