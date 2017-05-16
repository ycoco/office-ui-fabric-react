const doc = 'ms-word';
const one = 'onenote|UsePlain';
const ppt = 'ms-powerpoint';
const xls = 'ms-excel';
const vsd = 'ms-visio';
const pub = 'ms-publisher';
const accdb = 'ms-access';
const mpp = 'ms-project';

export const wordType = doc;
export const onenoteType = one;
export const powerpointType = ppt;
export const excelType = xls;
export const visioType = vsd;

export const OfficeAppToExtensionsMap = {
    'ms-access': ['accdb'],
    'ms-word': ['doc', 'docm', 'docx', 'dot', 'dotm', 'dotx', 'odt'],
    'ms-project': ['mpp'],
    'onenote|UsePlain': ['one', 'onepkg', 'onetoc2', 'notebook'],
    'ms-powerpoint': ['odp', 'pot', 'potm', 'potx', 'ppa', 'ppam', 'pps', 'ppsm', 'ppsx', 'ppt', 'pptm', 'pptx'],
    'ms-publisher': ['pub'],
    'ms-excel': ['ods', 'xla', 'xlam', 'xll', 'xls', 'xlsb', 'xlsm', 'xlsx', 'xlt', 'xltm', 'xltx'],
    'ms-visio': ['vdw', 'vsd', 'vsdm', 'vsdx', 'vsl', 'vss', 'vssm', 'vssx', 'vst', 'vstm', 'vstx']
};

export const OfficeIconFileTypeMap = {
    accdb: accdb,
    doc: doc,
    docm: doc,
    docx: doc,
    dot: doc,
    dotm: doc,
    dotx: doc,
    pdf: doc,
    odp: ppt,
    ods: xls,
    odt: doc,
    one: one,
    onepkg: one,
    onetoc2: one,
    mpp: mpp,
    notebook: one,
    pot: ppt,
    potm: ppt,
    potx: ppt,
    ppa: ppt,
    ppam: ppt,
    pps: ppt,
    ppsm: ppt,
    ppsx: ppt,
    ppt: ppt,
    pptm: ppt,
    pptx: ppt,
    pub: pub,
    vdw: vsd,
    vsd: vsd,
    vsdm: vsd,
    vsdx: vsd,
    vsl: vsd,
    vss: vsd,
    vssm: vsd,
    vssx: vsd,
    vst: vsd,
    vstm: vsd,
    vstx: vsd,
    xla: xls,
    xlam: xls,
    xll: xls,
    xls: xls,
    xlsb: xls,
    xlsm: xls,
    xlsx: xls,
    xlt: xls,
    xltm: xls,
    xltx: xls
};

const officeFriendlyNameMap = {
    [accdb]: 'Access',
    [doc]: 'Word',
    [one]: 'OneNote',
    [ppt]: 'PowerPoint',
    [xls]: 'Excel',
    [vsd]: 'Visio',
    [pub]: 'Publisher',
    [mpp]: 'Project'
};

export function getOfficeAppFriendlyName(app: string): string {
    return officeFriendlyNameMap[app] || app;
}

const officeAppMap = {
    [doc]: 'Word',
    [xls]: 'Excel',
    [ppt]: 'PowerPoint',
    [one]: 'OneNote',
    [vsd]: 'Visio'
};

export function getApp(item: { appMap?: string, extension?: string }) {
    const extension = item.extension;
    // Special case pdf, because it's mapped to word but we want to distinguish it
    // on the navigation to wac
    if (extension && extension.toLowerCase() === ".pdf") {
        return 'WordPdf';
    }

    // Default to word in case no match is found
    return officeAppMap[item.appMap] || 'Word';
}