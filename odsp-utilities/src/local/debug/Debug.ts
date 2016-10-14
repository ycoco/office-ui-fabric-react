// OneDrive:IgnoreCodeCoverage
/* tslint:disable */ 

/* Do not make references to this module. */
/* It will be automatically added to DEBUG builds and left out in SHIP builds. */

var DEBUG: boolean = true;
var ASSERT = function  (condition: boolean, message?: string): void {
 	if (!condition) {
       message = message || "Assertion failed";
       if (typeof Error !== "undefined") {
           throw new Error(message);
       }
   throw message;
   }
};
