import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';

const rowData: any = [
  {
    "ID": "1",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f1_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "236",
    "Title": "John Doe",
    "FileLeafRef": "1_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "44",
    "Age." : "44.00000000000",
    "Grade": "88",
    "ticker": "",
    "isbn": "<script>alert('foo')</script>",
    "bugCount": "5",
    "JanSales": "5,064",
    "JanSales." : "5064.00000000000",
    "FebSales": "6,026",
    "MarSales": "8,794",
    "percentOfTotal": "",
    "dueDate": "",
    "dueDate.": "",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "2",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f2_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "236",
    "Title": "Jane Doe",
    "FileLeafRef": "2_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "34",
    "Age." : "34.00000000000",
    "Grade": "93",
    "ticker": "",
    "isbn": "",
    "bugCount": "15",
    "JanSales": "6,064",
    "JanSales." : "6064.00000000000",
    "FebSales": "7,026",
    "MarSales": "6,794",
    "percentOfTotal": "",
    "dueDate": "3/31/2017",
    "dueDate.": "2017-03-31T07:00:00Z",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "3",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f3_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "244",
    "Title": "Vikram Singh",
    "FileLeafRef": "3_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "46",
    "Age." : "46.00000000000",
    "Grade": "85",
    "ticker": "",
    "isbn": "",
    "bugCount": "35",
    "JanSales": "9,064",
    "JanSales." : "9064.00000000000",
    "FebSales": "8,026",
    "MarSales": "9,794",
    "percentOfTotal": "",
    "dueDate": "3/31/2057",
    "dueDate.": "2027-03-31T07:00:00Z",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "4",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f4_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "244",
    "Title": "Robert Smith",
    "FileLeafRef": "4_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "20",
    "Age." : "20.00000000000",
    "Grade": "67",
    "ticker": "",
    "isbn": "",
    "bugCount": "45",
    "JanSales": "2,064",
    "JanSales." : "2064.00000000000",
    "FebSales": "7,026",
    "MarSales": "4,794",
    "percentOfTotal": "",
    "dueDate": "",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "5",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f5_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "198",
    "Title": "Microsoft",
    "FileLeafRef": "5_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "MSFT",
    "isbn": "",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentOfTotal": "",
    "dueDate": "",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "6",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f6_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "190",
    "Title": "Apple",
    "FileLeafRef": "6_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "AAPL",
    "isbn": "",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentOfTotal": "",
    "dueDate": "",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "7",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f7_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "192",
    "Title": "Google",
    "FileLeafRef": "7_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "GOOG",
    "isbn": "",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentOfTotal": "",
    "dueDate": "",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "8",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f8_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "192",
    "Title": "Amazon",
    "FileLeafRef": "8_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "AMZN",
    "isbn": "",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentOfTotal": "",
    "dueDate": "",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "9",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f9_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "192",
    "Title": "FaceBook",
    "FileLeafRef": "9_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "FB",
    "isbn": "",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentOfTotal": "",
    "dueDate": "",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "10",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f10_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "220",
    "Title": "The Hobbit",
    "FileLeafRef": "10_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "",
    "isbn": "0345538374",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentOfTotal": "",
    "dueDate": "3\u002f9\u002f2017",
    "dueDate.": "2017-03-09T07:00:00Z",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "11",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f11_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "250",
    "Title": "Harry Potter - Goblet of Fire",
    "FileLeafRef": "11_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "",
    "isbn": "0439139600",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentOfTotal": "",
    "dueDate": "",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "12",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f12_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "216",
    "Title": "Hunger Games",
    "FileLeafRef": "12_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "",
    "isbn": "0439023521",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentOfTotal": "",
    "dueDate": "",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "13",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f13_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "202",
    "Title": "Health Care",
    "FileLeafRef": "13_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "",
    "isbn": "",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentOfTotal": ".27",
    "dueDate": "",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "14",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f14_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "210",
    "Title": "Social Security",
    "FileLeafRef": "14_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "",
    "isbn": "",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentOfTotal": ".33",
    "dueDate": "",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "15",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f15_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "196",
    "Title": "Military",
    "FileLeafRef": "15_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "",
    "isbn": "",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentOfTotal": ".16",
    "dueDate": "",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "16",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f16_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "196",
    "Title": "Interest",
    "FileLeafRef": "16_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "",
    "isbn": "",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentOfTotal": ".06",
    "dueDate": "",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "17",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f17_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "196",
    "Title": "Veterans",
    "FileLeafRef": "17_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "",
    "isbn": "",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentOfTotal": ".04",
    "dueDate": "",
    "dueDate.FriendlyDisplay": ""
  }
  , {
    "ID": "18",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f18_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "202",
    "Title": "Agriculture",
    "FileLeafRef": "18_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "",
    "isbn": "",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentOfTotal": ".035",
    "dueDate": "",
    "dueDate.FriendlyDisplay": ""
  }, {
    "ID": "19",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f19_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "206",
    "Title": "A task item",
    "FileLeafRef": "19_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "",
    "isbn": "",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentTotal": "",
    "dueDate": "3\u002f31\u002f2017",
    "dueDate.": "2017-03-31T07:00:00Z",
    "dueDate.FriendlyDisplay": "",
    "AssignedTo": [{ "id": "33", "title": "Alex Burst", "email": "alexburs@microsoft.com", "sip": "alexburs@microsoft.com", "picture": "" }]
  }
  , {
    "ID": "20",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f20_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "208",
    "Title": "Another task",
    "FileLeafRef": "20_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "",
    "isbn": "",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentTotal": "",
    "dueDate": "3\u002f21\u002f2017",
    "dueDate.": "2017-03-21T07:00:00Z",
    "dueDate.FriendlyDisplay": "",
    "AssignedTo": [{ "id": "3", "title": "Cyrus Balsara", "email": "cyrusb@microsoft.com", "sip": "cyrusb@microsoft.com", "picture": "" }]
  }, {
    "ID": "22",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f22_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "200",
    "Title": "foo",
    "FileLeafRef": "22_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "",
    "isbn": "",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentTotal": "",
    "dueDate": "",
    "dueDate.FriendlyDisplay": "",
    "AssignedTo": "",
    "Comments": "",
    "Boolean": "",
    "Boolean.value": "",
    "Restaurant": "Red Robin",
    "CostLookup": [{ "lookupId": 2, "lookupValue": "Chicken", "isSecretFieldValue": false }],
    "CostLookup_x003a_Cost": "3.99"
  }, {
    "ID": "23",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f23_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "196",
    "Title": "bar",
    "FileLeafRef": "23_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "",
    "isbn": "",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentTotal": "",
    "dueDate": "",
    "dueDate.FriendlyDisplay": "",
    "AssignedTo": "",
    "Comments": "",
    "Boolean": "",
    "Boolean.value": "",
    "Restaurant": "Red Robin",
    "CostLookup": "",
    "CostLookup_x003a_Cost": ""
  }, {
    "ID": "24",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f23_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "196",
    "Title": "bar",
    "FileLeafRef": "23_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "",
    "Grade": "",
    "ticker": "",
    "isbn": "",
    "bugCount": "",
    "JanSales": "",
    "FebSales": "",
    "MarSales": "",
    "percentTotal": "",
    "dueDate": "",
    "dueDate.FriendlyDisplay": "",
    "AssignedTo": "",
    "Comments": "",
    "Boolean": "",
    "Boolean.value": "",
    "Restaurant": "Red Robin",
    "CostLookup": [{ "lookupId": 2, "lookupValue": "Tomatoes", "isSecretFieldValue": false }],
    "CostLookup_x003a_Cost": "2"
  },
  {
    "ID": "1001",
    "PermMask": "0x7ffffffffffbffff",
    "FSObjType": "0",
    "FileRef": "\u002fteams\u002fsts-dev\u002fLists\u002fCustomFields\u002f1_.000",
    "ItemChildCount": "0",
    "FolderChildCount": "0",
    "SMTotalSize": "236",
    "Title": "John Doe",
    "FileLeafRef": "1_.000",
    "File_x0020_Type": "",
    "File_x0020_Type.mapapp": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon": "",
    "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico": "icgen.gif",
    "ContentTypeId": "0x0100D75C91C5C5FA7E4BA63E301EEC7A14BB",
    "Age": "44",
    "Grade": "88",
    "ticker": "",
    "isbn": "<script>alert('foo')</script>",
    "bugCount": "0",
    "JanSales": "5,064",
    "FebSales": "6,026",
    "MarSales": "8,794",
    "percentOfTotal": "",
    "dueDate": "",
    "dueDate.FriendlyDisplay": ""
  }
];

export const locStrings = {
  elmTypeMissing: "Must specify elmType",
  elmTypeInvalid: "Invalid elmType:  {0}. Must be one of {1}.",
  operatorMissing: "Missing operator in expression: {0}.",
  operatorInvalid: "'{0}' is not a valid operator. It must be one of {1} in the expression {2}. ",
  operandMissing: "There must be at least 1 operand in the expression {0}",
  operandNOnly: "Expecting {0} operand(s) for the expression {1}",
  nan: "{0} is not a number. Number expected in the expression {1}",
  unsupportedType: "The type of field {0} is unsupported at this time.",
  ariaError: "No aria- tags found. As such, the field will not be accessible via a screen reader.",
  invalidProtocol: "Only http, https and mailto protocols are allowed.",
  invalidStyleValue: "Style values cannot contain unsafe expressions, behaviors or javascript.",
  invalidStyleAttribute: "'{0}' is not a valid style attribute."
};

/**
 * Example IHostSettings info
 */
export const contextInfo: ISpPageContext =
  {
    "webServerRelativeUrl": "/teams/sts-dev",
    "webAbsoluteUrl": "https://microsoft.sharepoint.com/teams/sts-dev",
    "viewId": "{722d060e-34e8-4ac3-9049-4534123abe16}",
    "listId": "{fc07024d-fb3f-4d6a-8148-1e8920b1bb84}",
    "listPermsMask": {
      "High": 2147483647,
      "Low": 4294705151
    },
    "listUrl": "/teams/sts-dev/Shared Documents",
    "listTitle": "Documents",
    "listBaseTemplate": 101,
    "viewOnlyExperienceEnabled": false,
    "blockDownloadsExperienceEnabled": false,
    "cdnPrefix": "static.sharepointonline.com/bld",
    "siteAbsoluteUrl": "https://microsoft.sharepoint.com/teams/sts-dev",
    "siteId": "{c02feed3-de64-42fd-bac4-10c0371b799e}",
    "showNGSCDialogForSyncOnTS": true,
    "supportPoundStorePath": true,
    "supportPercentStorePath": true,
    "isSPO": true,
    "farmLabel": "MSIT_Content",
    "serverRequestPath": "/teams/sts-dev/Shared Documents/Forms/AllItems.aspx",
    "layoutsUrl": "_layouts/15",
    "webId": "{ced113e9-bad5-4c09-a8cb-db6e6f7d23a5}",
    "webTitle": "SharePoint Team Sites Dev Team",
    "webDescription": "SharePoint Team Sites Dev Team",
    "webTemplate": "64",
    "webLogoUrl": "/teams/sts-dev/_api/GroupService/GetGroupImage?id='2a3fc241-e1a5-4a1d-bab7-6573d4189321'&hash=636270931418329556",
    "currentLanguage": 1033,
    "currentUICultureName": "en-US",
    "currentCultureName": "en-US",
    "env": "prodbubble",
    "siteClientTag": "0$$16.0.6330.1205",
    "openInClient": false,
    "webPermMasks": {
      "High": 2147483647,
      "Low": 4294705151
    },
    "userId": 3,
    "userLoginName": "cyrusb@microsoft.com",
    "userDisplayName": "Cyrus Balsara",
    "isAnonymousGuestUser": false,
    "isExternalGuestUser": false,
    "systemUserKey": "i:0h.f|membership|10033fff8006ca95@live.com",
    "themeCacheToken": "/teams/sts-dev::2:16.0.6330.1205",
    "themedCssFolderUrl": null,
    "isSiteAdmin": true,
    "CorrelationId": "7e68e59d-80fd-0000-5051-d849aef0c194",
    "hasManageWebPermissions": true,
    "isNoScriptEnabled": true,
    "groupId": "d80a128e-fc33-495a-8f5b-a4fda082f864",
    "groupHasHomepage": true,
    "siteClassification": "MBI",
    "hideSyncButtonOnODB": false,
    "showNGSCDialogForSyncOnODB": false,
    "sitePagesEnabled": true,
    "DesignPackageId": "00000000-0000-0000-0000-000000000000",
    "groupType": "Private",
    "groupColor": "#8151fd",
    "navigationInfo": {
      "quickLaunch": [],
      "topNav": []
    },
    "guestsEnabled": false,
    "MenuData": {
      "SettingsData": [{
        "Id": "SuiteMenu_zz8_MenuItemAddPage",
        "Text": "Add a page",
        "Url": "/teams/sts-dev/_layouts/15/CreateSitePage.aspx"
      }, {
        "Id": "SuiteMenu_zz5_MenuItemCreate",
        "Text": "Add an app",
        "Url": "/teams/sts-dev/_layouts/15/addanapp.aspx"
      }, {
        "Id": "SuiteMenu_zz6_MenuItem_ViewAllSiteContents",
        "Text": "Site contents",
        "Url": "/teams/sts-dev/_layouts/15/viewlsts.aspx"
      }, null, {
        "Id": "SuiteMenu_zz7_MenuItem_Settings",
        "Text": "Site settings",
        "Url": "/teams/sts-dev/_layouts/15/settings.aspx"
      }],
    },
    "RecycleBinItemCount": 0,
    "PublishingFeatureOn": false,
    "PreviewFeaturesEnabled": true,
    "disableAppViews": false,
    "disableFlows": false,
    "serverRedirectedUrl": null,
    "formDigestValue": "0x94E42703A123511071F832ABB3AAFB786A443406D5857D21CC8584AAB6DBB7A0C17631F09447AF1F21D2A10D3F99F85BC8571078E650BB7BF2F1736529B4D0E7,06 Apr 2017 17:41:13 -0000",
    "maximumFileSize": 15360,
    "formDigestTimeoutSeconds": 1800,
    "canUserCreateMicrosoftForm": true,
    "readOnlyState": null
  };

export const schema: any = {
  "Title": "Text",
  "Age": "Number",
  "Grade": "Number",
  "ticker": "Text",
  "isbn": "Text",
  "bugCount": "Number",
  "JanSales": "Number",
  "FebSales": "Number",
  "MarSales": "Number",
  "percentOfTotal": "Number",
  "dueDate": "DateTime",
  "AssignedTo": "User",
  "CostLookup": "Lookup",
  "CostLookup_x003a_Cost": "Lookup"
};

export const formatExamples = [
  {
    // Conditional formatting
    'display': 'Conditional formatting',
    'description': 'formats the cell to red if the field value for "age" is < 40 or to green if age is >= 40',
    'format': {
      'debugMode': true,
      'elmType': "div",
      'txtContent': '@currentField',
      'style': {
        'padding': '4px',
        'background-color': {
          'operator': ':',
          'operands': [
            {
              'operator': '<',
              'operands': ['@currentField', 40]
            },
            '#ff0000',
            '#00ff00',
          ]
        }
      }
    },
    'curField': 'Age',
    'rowData': [rowData[0], rowData[1], rowData[2], rowData[3]]
  },
  {
    'display': 'Custom URL buttons from field value',
    "description": "Creates a button that launches http://finance.yahoo.com/quote/ + ticker",
    'format': {
      'debugMode': true,
      'elmType': 'a',
      'txtContent': '[$Title]',
      'style': {
        'padding': '6px',
        'border': '1px solid #aaaaaa',
        'display': 'inline-block',
        'text-decoration': 'none',
        'border-radius': '5px'
      },
      'attributes': {
        'target': '_blank',
        'href': {
          'operator': '+',
          'operands': ['http://finance.yahoo.com/quote/', '@currentField']
        }
      }
    },
    'curField': 'ticker',
    'rowData': [rowData[4], rowData[5], rowData[6], rowData[7], rowData[8]]
  },
  {
    'display': 'Create Images from field value',
    "description": "Creates an image that points to http://covers.openlibrary.org/b/isbn/ + isbn",
    'format': {
      'debugMode': true,
      'elmType': 'img',
      'txtContent': '',
      'attributes': {
        'src': {
          'operator': '+',
          'operands': ['http://covers.openlibrary.org/b/isbn/', '@currentField', '-M.jpg'],
        }
      }
    },
    'curField': 'isbn',
    'rowData': [rowData[9], rowData[10], rowData[11]]
  },
  {
    'display': 'Data Bars',
    "description": "Creates excel-like data-bars where the width of the bar is proportional to bugCount",
    'format': {
      'debugMode': true,
      'elmType': 'div',
      'txtContent': '@currentField',
      'style': {
        'padding': '4px',
        'background-color': '#9999FF',
        'width': { // ([$bugCount]/40*100).toString() + '%'
          'operator': ':',
          'operands': [
            { 'operator': '>', 'operands': ['@currentField', '40'] },
            '100%',
            {
              'operator': '+',
              operands: [
                {
                  'operator': 'toString()',
                  'operands': [{ 'operator': '*', 'operands': ['@currentField', 2.5] /* 100/40*/ }],
                },
                '%'
              ]
            }
          ]
        }
      }
    },
    'curField': 'bugCount',
    'rowData': [rowData[0], rowData[1], rowData[2], rowData[3], rowData[23]]
  },
  {
    'display': 'Trending icons',
    "description": "Creates Excel-like trending icons. Green up arrow if feb>jan. Red down arrow if feb<jan",
    'format': {
      'debugMode': true,
      'elmType': 'div',
      'style': {
        'padding': '4px',
        'font-size': '25px'
      },
      'children': [
        {
          "elmType": "span",
          "txtContent": "[$FebSales]"
        },
        {
          "elmType": "span",
          "style": {
            "color": {
              "operator": ":",
              "operands": [
                { "operator": ">", "operands": ["[$FebSales]", "[$JanSales]"] },
                "#00AA00",
                "#ff0000"
              ]
            }
          },
          "txtContent": {
            "operator": ':',
            "operands":
            [
              { "operator": ">", "operands": ["[$FebSales]", "[$JanSales]"] },
              "↑",
              {
                "operator": ":",
                "operands": [
                  { "operator": "<", "operands": ["[$FebSales]", "[$JanSales]"] },
                  "↓",
                  ""
                ]
              }
            ]
          }
        }
      ]
    },
    'curField': 'FebSales',
    'rowData': [rowData[0], rowData[1], rowData[2], rowData[3]]
  },
  {
    'display': 'Bar chart',
    "description": "Renders a bar chart for the months of Jan, Feb, March with a max height of 80px",
    'format': {
      "debugMode": true,
      "elmType": "div",
      "style": {
        "padding": "4px",
        "height": "80px",
        "overflow": "hidden",
        "font-size": "x-small"
      },
      "children": [
        {
          "elmType": "span",
          "txtContent": {
            "operator": "+",
            "operands": [
              "Jan ($",
              {
                "operator": "toString()",
                "operands": [
                  "[$JanSales]"
                ]
              },
              ")"
            ]
          },
          "style": {
            "display": "inline-block",
            "padding": "4px",
            "margin-right": "4px",
            "vertical-align": "bottom",
            "background-color": "#ffaaaa",
            "max-width": "40px",
            "height": {
              "operator": "+",
              "operands": [
                {
                  "operator": "*",
                  "operands": [
                    "[$JanSales]",
                    0.008
                  ]
                },
                "px"
              ]
            }
          }
        },
        {
          "elmType": "span",
          "txtContent": {
            "operator": "+",
            "operands": [
              "Feb ($",
              {
                "operator": "toString()",
                "operands": [
                  "[$FebSales]"
                ]
              },
              ")"
            ]
          },
          "style": {
            "display": "inline-block",
            "padding": "4px",
            "margin-right": "4px",
            "vertical-align": "bottom",
            "background-color": "#aaaaff",
            "max-width": "40px",
            "height": {
              "operator": "+",
              "operands": [
                {
                  "operator": "*",
                  "operands": [
                    "[$FebSales]",
                    0.008
                  ]
                },
                "px"
              ]
            }
          }
        },
        {
          "elmType": "span",
          "txtContent": {
            "operator": "+",
            "operands": [
              "Mar ($",
              {
                "operator": "toString()",
                "operands": [
                  "[$MarSales]"
                ]
              },
              ")"
            ]
          },
          "style": {
            "display": "inline-block",
            "padding": "4px",
            "margin-right": "4px",
            "vertical-align": "bottom",
            "background-color": "#aaffaa",
            "max-width": "40px",
            "height": {
              "operator": "+",
              "operands": [
                {
                  "operator": "*",
                  "operands": [
                    "[$MarSales]",
                    0.008
                  ]
                },
                "px"
              ]
            }
          }
        }
      ]
    },
    'curField': 'MarSales',
    'rowData': [rowData[0], rowData[1], rowData[2], rowData[3]]
  },
  {
    "debugMode": true,
    "display": "Pie Chart",
    "description": "A field renderer that visualizes a percentage as a pie chart.",
    "format": {
      "elmType": "div",
      "style": {
        "display": "flex",
        "padding": "4px",
        "border": "1px solid #aaaaaa"
      },
      "children": [
        {
          "elmType": "div",
          "style": {
            "display": "inline-block",
            "background-color": "#aaaaaa",
            "border-radius": "100%",
            "fill": "#1b75bb",
            "width": "120px",  //diameter of pie chart is 120px... Radius is 60
            "height": "120px"
          },
          "children": [
            {
              "elmType": "svg",
              "children": [
                {
                  "elmType": "path",
                  "attributes":
                  {
                    "d": {
                      "operator": "+",
                      "operands":
                      [
                        "M60,60 L60,0, A60,60 0 ",
                        { "operator": ":", "operands": [{ "operator": "<=", "operands": ["[$percentOfTotal]", .5] }, "0", "1"] }, //0 (short path) if less than 50%. 1 (long path otherwise)
                        ",1 ",
                        {
                          "operator": "toString()", "operands": [
                            {
                              "operator": "+", "operands": //radius + y*radius where y = Math.sin((2 * Math.PI)/(percentvalue));
                              [60,
                                {
                                  "operator": "*", "operands":
                                  [
                                    {
                                      "operator": "sin", "operands":
                                      [
                                        { "operator": "*", "operands": [6.2831853, "[$percentOfTotal]"] }
                                      ]
                                    },
                                    60
                                  ]
                                }
                              ]
                            }
                          ]
                        },
                        ",",
                        {
                          "operator": "toString()", "operands":
                          [
                            {
                              "operator": "-", "operands": //radius - x*radius where y = cos((2 * Math.PI)/(percentvalue));
                              [60,
                                {
                                  "operator": "*", "operands":
                                  [
                                    {
                                      "operator": "cos", "operands":
                                      [
                                        { "operator": "*", "operands": [6.2831853, "[$percentOfTotal]"] }
                                      ]
                                    },
                                    60
                                  ]
                                }
                              ]
                            }
                          ]
                        },

                        " z"
                      ]
                    }
                  }
                }
              ]
            }
          ]
        },
        {
          "elmType": "div",
          "txtContent": { "operator": "+", "operands": ["[$Title]", "( ", { "operator": "toString()", "operands": [{ "operator": "*", "operands": ["[$percentOfTotal]", 100] }] }, "% )"] },
        }
      ]
    },
    'curField': 'percentOfTotal',
    'rowData': [rowData[12], rowData[13], rowData[14], rowData[15], rowData[16], rowData[17]]
  },
  {
    'debugMode': true,
    'display': 'Check for XSS vulnaribilities',
    'description': "validate that there is no XSS in the algorithm",
    'format': {
      "debugMode": true,
      "elmType": "a",
      "txtContent": "[$isbn]",
      "attributes": {
        "onclick": "alert('you allowed code via onClick')",
        "href": "javascript:alert('foo')",
        "target": "_blank",
        "src": {
          "operator": "+",
          "operands": [
            "http://covers.openlibrary.org/b/isbn/",
            "[$isbn]",
            "-M.jpg"
          ]
        }
      }
    },
    'curField': 'isbn',
    'rowData': [rowData[0], rowData[9], rowData[10], rowData[11]]
  },
  {
    'debugMode': true,
    'display': 'Validate User field and current user',
    'description': "Validate that @me and user fields works. AssignedTo == @me shows up in red",
    'format': {
      "elmType": "div",
      "txtContent": "@currentField.title",
      "style": {
        "color": {
          "operator": ":",
          "operands": [{
            "operator": "==",
            "operands": ["[$AssignedTo.email]", "@me"]
          },
            "#ff0000",
            ""
          ]
        }
      }
    },
    'curField': 'AssignedTo',
    'rowData': [rowData[19], rowData[18]]
  },
  {
    'debugMode': true,
    'display': 'Validate Date field and logical AND field',
    'description': "Validate that @now and Date fields works. (dueDate <= @now AND assignedTo.email == @me) shows up in red",
    'format': {
      "$schema": "http://cyrusb.blob.core.windows.net/playground/CustomFormatterSchema.json",
      "elmType": "div",
      "txtContent": "@currentField",
      "style": {
        "color": {
          "operator": ":",
          "operands": [
            {
              "operator": "&&",
              "operands": [
                {
                  "operator": "<=",
                  "operands": [
                    "@currentField",
                    "@now"
                  ]
                },
                {
                  "operator": "==",
                  "operands": [
                    "[$AssignedTo.email]",
                    "@me"
                  ]
                }
              ]
            },
            "#ff0000",
            ""
          ]
        }
      }
    },
    'curField': 'dueDate',
    'rowData': [rowData[19], rowData[18]]
  },
  {
    'display': 'Validate lookup field',
    'description': "Validate that Number() and Lookup fields works. CostLookup_x003a_Cost >= 3 shows up in red",
    'format': {
      "elmType": "div",
      "txtContent": "[$CostLookup.lookupValue]",
      "style": {
        "color": {
          "operator": ":",
          "operands": [
            {
              "operator": ">",
              "operands": [
                { "operator": "Number()", "operands": ["[$CostLookup_x003a_Cost]"] },
                3
              ]
            },
            "#ff0000",
            ""
          ]
        }
      }
    },
    'curField': 'AssignedTo',
    'rowData': [rowData[20], rowData[21], rowData[22]]
  },
  {
    'display': 'XSS - invalid style attribute',
    'description': "Ensure that invalid style attributes are not allowed",
    'format': {
      "debugMode": true,
      "elmType": "div",
      "txtContent": "@currentField",
      "style": {
        "padding": "4px",
        "bo\" onclick=alert(1)//rder": "1px solid #aaaaaa"
      }
    },
    'curField': 'bugCount',
    'rowData': [rowData[0], rowData[1], rowData[2]]
  },
  {
    'display': 'XSS - invalid style value - behavior',
    'description': "Ensure that behavior is not allowed in a style value",
    'format': {
      "debugMode": true,
      "elmType": "div",
      "txtContent": "@currentField",
      "style": {
        "padding": "behavior:",
      }
    },
    'curField': 'bugCount',
    'rowData': [rowData[0], rowData[1], rowData[2]]
  },
  {
    'display': 'XSS - invalid style value - expression',
    'description': "Ensure that expression is not allowed in a style value",
    'format': {
      "debugMode": true,
      "elmType": "div",
      "txtContent": "@currentField",
      "style": {
        "padding": "expression(",
      }
    },
    'curField': 'bugCount',
    'rowData': [rowData[0], rowData[1], rowData[2]]
  },
  {
    'display': 'XSS - invalid style value - javascript',
    'description': "Ensure that javascript is not allowed in a style value",
    'format': {
      "debugMode": true,
      "elmType": "div",
      "txtContent": "@currentField",
      "style": {
        "padding": "javascript:",
      }
    },
    'curField': 'bugCount',
    'rowData': [rowData[0], rowData[1], rowData[2]]
  },
  {
    'display': 'XSS - invalid style value - url',
    'description': "Ensure that url is not allowed in a style value",
    'format': {
      "debugMode": true,
      "elmType": "div",
      "txtContent": "@currentField",
      "style": {
        "background-image":"url(data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7)"
      },
    },
    'curField': 'bugCount',
    'rowData': [rowData[0], rowData[1], rowData[2]]
  },
  {
    // Conditional formatting - Color
    'display': 'Conditional formatting - Color',
    'description': 'formats the cell to green if the field value for "age" is != 44',
    'format': {
      "debugMode": true,
      "elmType": "div",
      "txtContent": "@currentField",
      "style": {
        "padding": "4px",
        "color": {
          "operator": ":",
          "operands": [
            {
              "operator": "!=",
              "operands": [
                "@currentField",
                44
              ]
            },
            "#ff0000",
            "#00ff00"
          ]
        }
      }
    },
    'curField': 'Age',
    'rowData': [rowData[0], rowData[1], rowData[2], rowData[3]]
  },
  {
    'debugMode': true,
    'display': 'Validate Date field works with null',
    'description': "Validate that date field works with null... If @currentField is blank, background color is red.",
    'format': {
      "$schema": "http://cyrusb.blob.core.windows.net/playground/CustomFormatterSchema.json",
      "debugMode": true,
      "elmType": "div",
      "txtContent": {
        "operator": ":",
        "operands": [
          {
            "operator": "==",
            "operands": [
              "@currentField",
              null
            ]
          },
          "_",
          "@currentField"
        ]
      },
      "style": {
        "background-color": {
          "operator": ":",
          "operands": [
            {
              "operator": "==",
              "operands": [
                "@currentField",
                null
              ]
            },
            "#ff0000",
            ""
          ]
        }
      }
    },
    'curField': 'dueDate',
    'rowData': [rowData[19], rowData[0]]
  },
  {
      'debugMode': true,
      'display': 'Validate Date field Math',
      'description': "Validate that date math works. Show dueDate < tomorrow in red",
      'format': {
        "$schema": "http://cyrusb.blob.core.windows.net/playground/CustomFormatterSchema.json",
        "elmType": "div",
        "txtContent": "@currentField",
        "style": {
          "color": {
            "operator": ":",
            "operands": [
              {
                "operator": "<=",
                "operands": [
                  "@currentField",
                  {
                    "operator": "+",
                    "operands": [
                      "@now",
                      86400000
                    ]
                  }
                ]
              },
              "#ff0000",
              ""
            ]
          }
        }
      },
      'curField': 'dueDate',
      'rowData': [rowData[1], rowData[2]]
    }
];