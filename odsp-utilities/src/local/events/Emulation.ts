
export interface ISendKeysParams {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    target?: Element;
    code?: number;
    type?: 'keydown' | 'keyup' | 'keypress';
}

export const Keys = {
    enter: 13,
    escape: 27,
    space: 32,
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40
};

export function pressKey(key: string, params: ISendKeysParams = {}) {
    const code = params.code || key.charCodeAt(0);
    let options = <any>{
        bubbles: true,
        cancelable: true,
        key: key,
        keyCode: code,
        ctrlKey: params.ctrl,
        shiftKey: params.shift,
        altKey: params.alt,
        metaKey: params.meta,
        which: code
    } as KeyboardEventInit;
    let event;
    try {
        event = new KeyboardEvent(params.type || 'keydown', options);
    } catch (e) {
        // Not supported by browser
    }
    const target = params.target || document.body;
    if (event) {
        if (!event.keyCode) {
            event['charCodeVal'] = code;
            Object.defineProperty(event, 'keyCode', { get: function () { return this.charCodeVal; } });
        }
        if (!event.which) {
            event['charCodeVal'] = code;
            Object.defineProperty(event, 'which', { get: function () { return this.charCodeVal; } });
        }
        target.dispatchEvent(event);
    } else {
        let keyboardEvent = document.createEvent('KeyboardEvent');
        if (keyboardEvent && keyboardEvent.initKeyboardEvent) {
            let modifiers = [];
            if (options.ctrlKey) {
                modifiers.push('Control');
            }
            if (options.metaKey) {
                modifiers.push('Meta');
            }
            if (options.altKey) {
                modifiers.push('Alt');
            }
            if (options.shiftKey) {
                modifiers.push('Shift');
            }
            keyboardEvent.initKeyboardEvent(
                params.type || 'keydown',
                options.bubbles,        // bubbles?
                options.cancelable,     // cancelable?
                window,                 // viewArg
                key,                    // keyArg
                0,                      // locationArg
                modifiers.join(' '),    // modifiersListArg
                false,                  // repeat
                ''
            );
            target.dispatchEvent(keyboardEvent);
        }
    }
}

export function pressEnter(params: ISendKeysParams = {}) {
    params.code = 13;
    pressKey('Enter', params);
}

export function pressEsc(params: ISendKeysParams = {}) {
    params.code = 27;
    pressKey('Esc', params);
}

export function pressKeys(keys: string, params?: ISendKeysParams) {
    for (let key of keys) {
        pressKey(key, params);
    }
}
