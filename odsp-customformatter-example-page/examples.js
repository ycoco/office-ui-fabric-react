var _data = [
  // Severity
  {
    "display": "Severity",
    "description": "Formats the cell to green if <20, yellow if <30, pink if <40, and orange if >40",
    "format": {
      "debugMode": true,
      "elmType": "div",
      "style": {
        "margin": "-10px",
        "font-size": "12px",
        "height": "40px",
        "display": "flex",
        "align-items": "center",
        "padding": "0 4px",
        "background-color": {
          "operator": ":",
          "operands": [
            { "operator": "<", "operands": ["@currentField", 20] },
            "rgba(255, 255, 255, 0)",
            {
              "operator": ":",
              "operands": [
                { "operator": "<", "operands": ["@currentField", 30] },
                "rgba(255, 185, 0, 0.2)",
                {
                  "operator": ":",
                  "operands": [
                    { "operator": "<", "operands": ["@currentField", 40] },
                    "rgba(234, 67, 0, 0.2)",
                    "rgba(232, 17, 35, 0.2)"
                  ]
                }
              ]
            }
          ]
        },
        "color": {
          "operator": ":",
          "operands": [
            { "operator": "<", "operands": ["@currentField", 20] },
            " ",
            {
              "operator": ":",
              "operands": [
                { "operator": "<", "operands": ["@currentField", 30] },
                "#666666",
                {
                  "operator": ":",
                  "operands": [
                    { "operator": "<", "operands": ["@currentField", 40] },
                    "#d83b01",
                    "#a80000"
                  ]
                }
              ]
            }
          ]
        }
      },
      "children": [
        {
          "elmType": "span",
          "style": {
            "font-size": "14px",
            "padding": "0 0 0 8px"
          },
          "attributes": {
            "class": {
              "operator": ":",
              "operands": [
                { "operator": "<", "operands": ["@currentField", 20] },
                " ",
                {
                  "operator": ":",
                  "operands": [
                    { "operator": "<", "operands": ["@currentField", 30] },
                    "ms-Icon ms-Icon--Warning",
                    {
                      "operator": ":",
                      "operands": [
                        { "operator": "<", "operands": ["@currentField", 40] },
                        "ms-Icon ms-Icon--Error",
                        "ms-Icon ms-Icon--ErrorBadge"
                      ]
                    }
                  ]
                }
              ]
            }
          }
        },
        {
          "elmType": "span",
          "style": {
            "display": "inline-block",
            "padding": "0 4px"
          },
          "txtContent": "@currentField"
        }
      ]
    },
    "curField": "Age",
    "rowData": [rowData[0], rowData[1], rowData[2], rowData[3]]
  },
  // Data bars
  {
    "display": "Data Bars",
    "description": "Creates excel-like data-bars where the width of the bar is proportional to bugCount",
    "format": {
      "debugMode": true,
      "elmType": "div",
      "txtContent": "@currentField",
      "style": {
        "font-size": "12px",
        "padding": "0px",
        "height": "36px",
        "background-color": "rgba(0, 120, 215, 0.1)",
        "border-top": "2px solid #0078D7",
        "width": { // ([$bugCount]/40*100).toString() + "%"
          "operator": ":",
          "operands": [
            { "operator": ">", "operands": ["@currentField", "40"] },
            "100%",
            {
              "operator": "+",
              operands: [
                {
                  "operator": "toString()",
                  "operands": [{ "operator": "*", "operands": ["@currentField", 2.5] /* 100/40*/ }],
                },
                "%"
              ]
            }
          ]
        }
      }
    },
    "curField": "bugCount",
    "rowData": [rowData[0], rowData[1], rowData[2], rowData[3]]
  },
  // Trending icons
  {
    "display": "Trending icons",
    "description": "Creates Excel-like trending icons. Green up arrow if feb>jan. Red down arrow if feb<jan",
    "format": {
      "debugMode": true,
      "elmType": "div",
      "style": {
        "padding": "4px",
        "font-size": "12px"
      },
      "children": [
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
          "attributes": {
            "class": {
              "operator": ":",
              "operands":
              [
                { "operator": ">", "operands": ["[$FebSales]", "[$JanSales]"] },
                "ms-Icon ms-Icon--Sortup",
                {
                  "operator": ":",
                  "operands": [
                    { "operator": "<", "operands": ["[$FebSales]", "[$JanSales]"] },
                    "ms-Icon ms-Icon--Sortdown",
                    ""
                  ]
                }
              ]
            }
          }
        },
        {
          "elmType": "span",
          "txtContent": "[$FebSales]"
        }
      ]
    },
    "curField": "FebSales",
    "rowData": [rowData[0], rowData[1], rowData[2], rowData[3]]
  },
  // Quick actions
  {
    "display": "Quick actions",
    "description": "Creates icon buttons for direct actions",
    "format": {
      "debugMode": true,
      "elmType": "div",
      "style": {
        "font-size": "14px"
      },
      "children": [{
        "elmType": "span",
        "style": {
          "padding": "0 8px"
        },
        "attributes": {
          "class": "ms-Icon ms-Icon--CheckMark"
        }
      },
      {
        "elmType": "span",
        "style": {
          "padding": "0 8px"
        },
        "attributes": {
          "class": "ms-Icon ms-Icon--Cancel"
        }
      },
      {
        "elmType": "span",
        "style": {
          "padding": "0 8px"
        },
        "attributes": {
          "class": "ms-Icon ms-Icon--Mail"
        }
      }
      ]
    },
    "curField": "FebSales",
    "rowData": [rowData[0], rowData[1], rowData[2], rowData[3]]
  },
  // Files that need attention MVP
  {
    "display": "Files that need attention MVP",
    "description": "Creates warning style for files that need attention",
    "format": {
      "debugMode": true,
      "elmType": "div",
      "style": {
        "background-color": "rgba(255, 185, 0, 0.2)",
        "margin": "1px",
        "font-size": "12px",
        "align": "middle"
      },
      "children": [
        {
          "elmType": "span",
          "attributes": {
            "class": "ms-Icon ms-Icon--warning"
          }
        },
        {
          "elmType": "span",
          "txtContent": " ",
        },
        {
          "elmType": "span",
          "txtContent": "Missing",
        }
      ]
    },
    "curField": "Category",
    "rowData": [rowData[0], rowData[1], rowData[2], rowData[3]]
  },
  //Date severity
  {
    "display": "Date severity",
    "description": "Format a date field to red with icon if dueDate is less than 90 days",
    "format": {
      "$schema": "http://cyrusb.blob.core.windows.net/playground/CustomFormatterSchema.json",
      "debugMode": true,
      "elmType": "div",
      "style": {
        "margin": "-10px",
        "font-size": "12px",
        "height": "40px",
        "display": "flex",
        "align-items": "center",
        "padding": "0 4px",
        "background-color": {
          "operator": ":",
          "operands": [
            {
              "operator": "&&",
              "operands": [
                {
                  "operator": "<=",
                  "operands": [
                    "@currentField",
                    {
                      "operator": "+",
                      "operands": [
                        "@now",
                        7776000000
                      ]
                    }
                  ]
                },
                {
                  "operator": ">",
                  "operands": [
                    "@currentField",
                    "@now"
                  ]
                }
              ]
            },
            "rgba(234, 67, 0, 0.2)",
            ""
          ]
        }
      },
      "children": [
        {
          "elmType": "span",
          "style": {
            "font-size": "14px",
            "padding": "0 0 0 8px"
          },
          "attributes": {
            "iconName": {
              "operator": ":",
              "operands": [
                {
                  "operator": "&&",
                  "operands": [
                    {
                      "operator": "<=",
                      "operands": [
                        "@currentField",
                        {
                          "operator": "+",
                          "operands": [
                            "@now",
                            7776000000
                          ]
                        }
                      ]
                    },
                    {
                      "operator": ">",
                      "operands": [
                        "@currentField",
                        "@now"
                      ]
                    }
                  ]
                },
                "Error",
                ""
              ]
            }
          }
        },
        {
          "elmType": "span",
          "style": {
            "display": "inline-block",
            "padding": "0 4px"
          },
          "txtContent": "@currentField"
        }
      ]
    },
    "curField": "dueDate",
    "rowData": [rowData[0], rowData[1], rowData[2], rowData[3]]
  }

];