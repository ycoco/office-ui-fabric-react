import ItemType from './ItemType';

/**
 * Enumeration of icon file names, and what extensions they map to.
 * Please keep items alphabetical. Items without extensions may require specific logic in the code to map.
 * Track icon accuracy status here: https://msft-my.spoppe.com/personal/caperez_microsoft_com/Documents/Missing%20List.xlsx?web=1
 */
let FileTypeIconMap = {
    'accdb': { extensions: ['accdb', 'mdb'] },
    'archive': { type: ItemType.Unknown, extensions: ['7z', 'ace', 'arc', 'arj', 'dmg', 'gz', 'iso', 'lzh', 'pkg', 'rar', 'sit', 'tgz', 'tar', 'rar', 'z'] },
    'audio': { type: ItemType.Unknown, extensions: ['aif', 'aiff', 'aac', 'amr', 'au', 'awb', 'dct', 'dss', 'dvf', 'flac', 'gsm', 'm4a', 'm4p', 'mid', 'mmf', 'mp3', 'ogg', 'oga', 'ra', 'rm', 'wav', 'wma', 'wv'] },
    'code': { extensions: ['Hcp', 'abap', 'ada', 'adp', 'ahk', 'as', 'as3', 'asc', 'ascx', 'asm', 'asp', 'awk', 'bash', 'bash_login', 'bash_logout', 'bash_profile', 'bashrc', 'bat', 'bib', 'bsh', 'build', 'builder', 'c', 'c++', 'capfile', 'cc', 'cfc', 'cfm', 'cfml', 'cl', 'clj', 'cls', 'cmake', 'cmd', 'coffee', 'cpp', 'cpt', 'cpy', 'cs', 'cshtml', 'cson', 'csproj', 'css', 'ctp', 'cxx', 'd', 'ddl', 'di', 'disco', 'dml', 'dtd', 'dtml', 'el', 'emakefile', 'erb', 'erl', 'f', 'f90', 'f95', 'fs', 'fsi', 'fsscript', 'fsx', 'gemfile', 'gemspec', 'gitconfig', 'go', 'groovy', 'gvy', 'h', 'h++', 'haml', 'handlebars', 'hbs', 'hh', 'hpp', 'hrl', 'hs', 'htc', 'hxx', 'idl', 'iim', 'inc', 'inf', 'ini', 'inl', 'ipp', 'irbrc', 'jade', 'jav', 'java', 'js', 'json', 'jsp', 'jsx', 'l', 'less', 'lhs', 'lisp', 'log', 'lst', 'ltx', 'lua', 'm', 'make', 'markdn', 'markdown', 'mdown', 'mkdn', 'ml', 'mli', 'mll', 'mly', 'mm', 'mud', 'nfo', 'opml', 'osascript', 'p', 'pas', 'patch', 'php', 'php2', 'php3', 'php4', 'php5', 'phtml', 'pl', 'pm', 'pod', 'pp', 'profile', 'ps1', 'pt', 'py', 'pyw', 'r', 'rake', 'rb', 'rbx', 'rc', 're', 'reg', 'rest', 'resw', 'resx', 'rhtml', 'rjs', 'rprofile', 'rpy', 'rss', 'rst', 'rxml', 's', 'sass', 'scala', 'scm', 'sconscript', 'sconstruct', 'script', 'scss', 'sgml', 'sh', 'sh', 'shtml', 'sml', 'sql', 'sql', 'sty', 'tcl', 'tex', 'textile', 'tld', 'tli', 'tmpl', 'tpl', 'vb', 'vi', 'vim', 'wsdl', 'xhtml', 'xoml', 'xsd', 'xslt', 'yaml', 'yaws', 'yml', 'zsh'] },
    'css': {}, // we dont have the icon yet, but i believe we want it, snapping to 'code' for now
    'csv': { extensions: ['csv'] },
    'docset': { type: ItemType.Folder, iconType: 'svg' },
    'docx': { extensions: ['doc', 'docm', 'docx'] },
    'dotx': { extensions: ['dot', 'dotm', 'dotx'] },
    'email': { type: ItemType.Unknown, extensions: ['eml', 'msg', 'ost', 'pst'] },
    'exe': { type: ItemType.Unknown, extensions: ['application', 'appref-ms', 'apk', 'app', 'appx', 'exe', 'ipa', 'msi', 'xap'] },
    'folder': { type: ItemType.Folder, iconType: 'svg' },
    'font': { type: ItemType.Unknown, extensions: ['ttf', 'otf', 'woff'] },
    'genericfile': { type: ItemType.Unknown },
    'html': { extensions: ['htm', 'html', 'mht'] },
    'link': { type: ItemType.Unknown, extensions: ['lnk', 'link', 'url', 'website', 'webloc'] },
    'listitem': { type: ItemType.Unknown, extensions: ['listitem'] },
    'model': { extensions: ['3ds', 'blend', 'dae', 'df', 'dwfx', 'dwg', '3mf', 'fbx', 'ply', 'obj', 'stl', 'gltf', 'glb', 'dxf', 'layout', 'off', 'max', 'skp', 'stp', 't', 'thl', 'x'] },
    'mpp': { extensions: ['mpp'] },
    'mpt': { extensions: ['mpt'] },
    'odp': { extensions: ['odp'] },
    'ods': { extensions: ['ods'] },
    'odt': { extensions: ['odt'] },
    'one': { type: ItemType.OneNote, extensions: ['one'] }, // this is a format for exported single-file notebook pages
    'onepkg': { type: ItemType.OneNote, extensions: ['onepkg'] }, // this is a format for exported single-file notebook section pkgs (multi-page)
    'onetoc': { type: ItemType.OneNote, extensions: ['ms-one-stub', 'onetoc', 'onetoc2'] }, // this icon represents a complete, logical notebook.
    'pdf': { extensions: ['pdf'] },
    'photo': { type: ItemType.Media, extensions: ['arw', 'bmp', 'cr2', 'crw', 'dcr', 'dds', 'dib', 'dng', 'erf', 'gif', 'ico', 'jfi', 'jfif', 'jif', 'jpe', 'jpeg', 'jpg', 'kdc', 'mrw', 'nef', 'orf', 'pct', 'pict', 'png', 'pns', 'psd', 'raw', 'tga', 'tif', 'tiff', 'wdp'] },
    'potx': { extensions: ['pot', 'potm', 'potx'] },
    'ppsx': { extensions: ['pps', 'ppsm', 'ppsx'] },
    'pptx': { extensions: ['ppt', 'pptm', 'pptx'] },
    'pub': { extensions: ['pub'] },
    'spo': { extensions: ['aspx'] },
    'rtf': { extensions: ['epub', 'rtf', 'wri'] },
    'sharedfolder': { type: ItemType.Folder, iconType: 'svg' },
    'sysfile': { type: ItemType.Unknown, extensions: ['bak', 'bin', 'cab', 'cache', 'cat', 'cer', 'class', 'dat', 'db', 'dbg', 'dl_', 'dll', 'ithmb', 'jar', 'kb', 'kdc', 'ldt', 'lrprev', 'ppa', 'ppam', 'pdb', 'rom', 'thm', 'thmx', 'vsl', 'xla', 'xlam', 'xll'] },
    'txt': { extensions: ['dif', 'diff', 'md', 'markdown', 'out', 'plist', 'properties', 'readme', 'text', 'txt'] },
    'vector': { type: ItemType.Unknown, extensions: ['ai', 'dgn', 'pd', 'emf', 'eps', 'indd', 'indt', 'ps', 'svg', 'svgz', 'wmf'] },
    'video': { type: ItemType.Media, extensions: ['3gp', 'asf', 'avi', 'dvr-ms', 'flv', 'm1v', 'm4v', 'mkv', 'mod', 'mov', 'mm4p', 'mp2', 'mp2v', 'mp4', ' mpa', 'mpe', 'mpeg', 'mpg', 'mpv', 'mpv2', 'mts', 'ogg', 'qt', 'swf', 'ts', 'vob', 'webm', 'wlmp', 'wm', 'wmv', 'wmx'] },
    'vsdx': { extensions: ['vsd', 'vsdm', 'vsdx', 'vdw'] },
    'vssx': { extensions: ['vss', 'vssm', 'vssx'] },
    'vstx': { extensions: ['vst', 'vstm', 'vstx'] },
    'xlsx': { extensions: ['xls', 'xlsb', 'xlsm', 'xlsx'] },
    'xltx': { extensions: ['xlt', 'xltm', 'xltx'] },
    'xml': { extensions: ['xaml', 'xml', 'xsl'] },
    'xps': { extensions: ['oxps', 'xps'] },
    'xsn': { extensions: ['xsn'] },
    'zip': { type: ItemType.Unknown, extensions: ['zip'] }
};

export default FileTypeIconMap;