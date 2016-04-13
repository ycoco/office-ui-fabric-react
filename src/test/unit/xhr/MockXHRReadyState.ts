/**
 * The ready state enum
 * Look at https://msdn.microsoft.com/en-us/library/ie/ms534361(v=vs.85).aspx
 */
 const enum MockXHRReadyState {
    UNINITIALIZED = 0,
    LOADING = 1,
    LOADED = 2,
    INTERACTIVE = 3,
    COMPLETE = 4
}

export default MockXHRReadyState;