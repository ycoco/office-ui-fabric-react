const enum Error {
    authFailure = 1,
    serverFailure = 2,
    invalidItem = 3,
    invalidWebAbsoluteUrl = 4,
    generic = 5
}

/**
 * Which API returned an error.
 */
export const enum Category {
    getSharingInformation = 1,
    shareLink = 2,
    shareObject = 3
}

export default Error;