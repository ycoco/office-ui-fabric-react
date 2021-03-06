import { IRectangle } from './IRectangle';

/**
 * Attached interface for elements which support virtual references.
 * Used internally by the virtual hierarchy methods.
 */
interface IVirtualElement extends HTMLElement {
  _virtual: {
    parent?: IVirtualElement;
    children: IVirtualElement[];
  };
}

/**
 * Sets the virtual parent of an element.
 * Pass `undefined` as the `parent` to clear the virtual parent.
 */
export function setVirtualParent(child: HTMLElement, parent: HTMLElement) {
  let virtualChild = <IVirtualElement>child;
  let virtualParent = <IVirtualElement>parent;

  if (!virtualChild._virtual) {
    virtualChild._virtual = {
      children: []
    };
  }

  let oldParent = virtualChild._virtual.parent;

  if (oldParent && oldParent !== parent) {
    // Remove the child from its old parent.
    let index = oldParent._virtual.children.indexOf(virtualChild);

    if (index > -1) {
      oldParent._virtual.children.splice(index, 1);
    }
  }

  virtualChild._virtual.parent = virtualParent || undefined;

  if (virtualParent) {
    if (!virtualParent._virtual) {
      virtualParent._virtual = {
        children: []
      };
    }

    virtualParent._virtual.children.push(virtualChild);
  }
}

export function getVirtualParent(child: HTMLElement): HTMLElement | undefined {
  let parent: HTMLElement | undefined;

  if (child && isVirtualElement(child)) {
    parent = child._virtual.parent;
  }

  return parent;
}

/**
 * Gets the element which is the parent of a given element.
 * If `allowVirtuaParents` is `true`, this method prefers the virtual parent over
 * real DOM parent when present.
 */
export function getParent(child: HTMLElement, allowVirtualParents: boolean = true): HTMLElement | null {
  return child && (
    allowVirtualParents && getVirtualParent(child) ||
    child.parentNode && child.parentNode as HTMLElement
  );
}

/**
 * Determines whether or not a parent element contains a given child element.
 * If `allowVirtualParents` is true, this method may return `true` if the child
 * has the parent in its virtual element hierarchy.
 */
export function elementContains(parent: HTMLElement | null, child: HTMLElement | null, allowVirtualParents: boolean = true): boolean {
  let isContained = false;

  if (parent && child) {
    if (allowVirtualParents) {
      isContained = false;

      while (child) {
        let nextParent: HTMLElement | null = getParent(child);

        if (nextParent === parent) {
          isContained = true;
          break;
        }

        child = nextParent;
      }
    } else if (parent.contains) {
      isContained = parent.contains(child);
    }
  }

  return isContained;
}

let _isSSR = false;

/**
 * Helper to set ssr mode to simulate no window object returned from getWindow helper.
 */
export function setSSR(isEnabled: boolean) {
  _isSSR = isEnabled;
}

/** Helper to get the window object. */
export function getWindow(rootElement?: HTMLElement) {
  if (_isSSR || typeof window === 'undefined') {
    return undefined;
  } else {
    return (
      rootElement &&
        rootElement.ownerDocument &&
        rootElement.ownerDocument.defaultView ?
        rootElement.ownerDocument.defaultView :
        window
    );
  }
}

/**
 * Helper to get the document object.
 */
export function getDocument(rootElement?: HTMLElement) {
  if (_isSSR || typeof document === 'undefined') {
    return undefined;
  } else {
    return rootElement && rootElement.ownerDocument ? rootElement.ownerDocument : document;
  }
}

/**
 * Helper to get bounding client rect, works with window.
 */
export function getRect(element: HTMLElement | Window | null): IRectangle | undefined {
  let rect: IRectangle | undefined;

  if (element) {
    if (element === window) {
      rect = {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        right: window.innerWidth,
        bottom: window.innerHeight
      };
    } else if ((element as HTMLElement).getBoundingClientRect) {
      rect = (element as HTMLElement).getBoundingClientRect();
    }
  }

  return rect;
}

/**
 * Determines whether or not an element has the virtual hierarchy extension.
 */
function isVirtualElement(element: HTMLElement | IVirtualElement): element is IVirtualElement {
  return element && !!(<IVirtualElement>element)._virtual;
}
