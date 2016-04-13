import Point from './Point';
import Size from './Size';

/**
 * Describes an area enclosed by an upper-left coordinate plus a width and height.
 */
export default class Rectangle {
    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;

    constructor();
    constructor(rect: Rectangle);
    constructor(rect: ClientRect);
    constructor(point: Point, size: Size);
    constructor(x: number, y: number, width: number, height: number);
    constructor(arg0?: any, arg1?: any, arg2?: any, arg3?: any) {
        if (arguments.length === 0) {
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
        } else if (arg0 instanceof Rectangle) {
            var rect = <Rectangle>arg0;

            this.x = rect.x;
            this.y = rect.y;
            this.width = rect.width;
            this.height = rect.height;
        } else if (arg0 instanceof Point) {
            var point = <Point>arg0;
            var size = <Size>arg1;

            this.x = point.x;
            this.y = point.y;
            this.width = size.width;
            this.height = size.height;
        } else if (typeof arg0 === 'object' && // workaround for Firefox that returns DOMRect instead of ClientRect
                   typeof arg0.left === 'number' &&
                   typeof arg0.top === 'number' &&
                   typeof arg0.width === 'number' &&
                   typeof arg0.height === 'number') {
            var cRect = <ClientRect>arg0;
            this.x = cRect.left;
            this.y = cRect.top;
            this.width = cRect.width;
            this.height = cRect.height;
        } else {
            this.x = <number>arg0;
            this.y = <number>arg1;
            this.width = <number>arg2;
            this.height = <number>arg3;
        }
    }

    /**
     * Clips the Rectangle to fit within the specified bounds and returns the result.
     */
    clip(bounds: Rectangle): Rectangle {
        var rect = new Rectangle(this);

        if (rect.x < bounds.x) {
            rect.width -= bounds.x - rect.x;
            rect.x = bounds.x;
        }
        if (rect.getRight() > bounds.getRight()) {
            rect.width -= rect.getRight() - bounds.getRight();
        }
        if (rect.y < bounds.y) {
            rect.height -= bounds.y - rect.y;
            rect.y = bounds.y;
        }
        if (rect.getBottom() > bounds.getBottom()) {
            rect.height -= rect.getBottom() - bounds.getBottom();
        }

        return rect;
    }

    /**
     * Determines if the specified Point or Rectangle is entirely contained by this Rectangle.
     */
    contains(val: Point|Rectangle): boolean {
        if (val instanceof Point) {
            // test if a single point is contained within this Rectangle
            var point = <Point>val;

            return ((point.x >= this.x) &&
                    (point.y >= this.y) &&
                    (point.x <= this.getRight()) &&
                    (point.y <= this.getBottom()));
        } else {
            // test upper-left and lower-right points of the Rectangle
            var rect = <Rectangle>val;
            var pointA = rect.getPoint();
            var pointB = new Point(rect.getRight(), rect.getBottom());

            return (this.contains(pointA) && this.contains(pointB));
        }
    }

    getCenter(): Point {
        return new Point(this.x + this.width / 2, this.y + this.height / 2);
    }

    getLeft(): number {
        return this.x;
    }

    getTop(): number {
        return this.y;
    }

    getRight(): number {
        return this.x + this.width;
    }

    getBottom(): number {
        return this.y + this.height;
    }

    getPoint(): Point {
        return new Point(this.x, this.y);
    }

    getSize(): Size {
        return new Size(this.width, this.height);
    }

    /**
     * Enlarges the Rectangle by the specified amount while leaving the center point unchanged and returns a new Rectangle.
     * Negative values will "deflate" the Rectangle.
     */
    inflate(size: Size);
    inflate(width: number, height: number);
    inflate(arg0?: any, arg1?: any): Rectangle {
        let dx: number;
        let dy: number;

        if (typeof arg0 === 'object') {
            let size = <Size>arg0;
            dx = size.width;
            dy = size.height;
        } else {
            dx = <number>arg0;
            dy = <number>arg1;
        }

        return new Rectangle(
            this.x - dx / 2,
            this.y - dy / 2,
            this.width + dx,
            this.height + dy);
    }

    /**
     * Translates the Rectangle by the minimum distance to try and fit within the specified bounds.
     */
    nudge(bounds: Rectangle): Rectangle {
        var result = new Rectangle(this);

        if (result.x < bounds.x) {
            result.x = bounds.x;
        } else if (result.getRight() > bounds.getRight()) {
            result.x = bounds.getRight() - result.width;
        }

        if (result.y < bounds.y) {
            result.y = bounds.y;
        } else if (result.getBottom() > bounds.getBottom()) {
            result.y = bounds.getBottom() - result.height;
        }

        return result;
    }

    /**
     * Translates the Rectangle along the x and y axis by the specified distance and returns the result.
     */
    translate(p: Point): Rectangle;
    translate(dx: number, dy: number): Rectangle;
    translate(arg0?: any, arg1?: any): Rectangle {
        var result: Rectangle;

        if (arg0 instanceof Point) {
            // allow distance to be specified in the coordinates of a Point
            var p = <Point>arg0;
            result = this.translate(p.x, p.y);
        } else {
            var dx = <number>arg0;
            var dy = arg1;
            result = new Rectangle(this.x + dx, this.y + dy, this.width, this.height);
        }

        return result;
    }

    /**
     * Calculates the smallest Rectangle that contains both this rectangle and the specified rectangle.
     */
    union(rect: Rectangle): Rectangle {
        var x1 = Math.min(this.x, rect.x);
        var y1 = Math.min(this.y, rect.y);
        var x2 = Math.max(this.x + this.width, rect.x + rect.width);
        var y2 = Math.max(this.y + this.height, rect.y + rect.height);
        return new Rectangle(x1, y1, x2 - x1, y2 - y1);
    }

    /**
     * Creates a new rectangle similar to the current rectangle, but fitted to the target rectangle,
     * either outside or inside.
     */
    fit(rect: Rectangle, isInside?: boolean): Rectangle {
        var coverRect = rect;

        if (this.width && this.height && (isInside ?
            (this.width > coverRect.width || this.height > coverRect.height) :
            (this.width > coverRect.width && this.height > coverRect.height))) {
            coverRect = this._scaleTo(rect, isInside);
        } else {
            coverRect = this;
        }

        var deltaX = (rect.width - coverRect.width) / 2;
        var deltaY = (rect.height - coverRect.height) / 2;

        return new Rectangle(
            deltaX + this.x,
            deltaY + this.y,
            coverRect.width,
            coverRect.height);
    }

    private _scaleTo(target: Rectangle, isInside?: boolean): Rectangle {
        var targetAspectRatio = target.width / target.height;
        var currentAspectRatio = this.width / this.height;

        var width = 0;
        var height = 0;

        var aspectRatio1 = isInside ? currentAspectRatio : targetAspectRatio;
        var aspectRatio2 = isInside ? targetAspectRatio : currentAspectRatio;

        if (aspectRatio1 < aspectRatio2) {
            // Target is skinnier than current. Match height of target area.
            height = target.height;
            width = currentAspectRatio * target.height;
        } else {
            // Current is skinnier than target. Match width of target area.
            width = target.width;
            height = target.width / currentAspectRatio;
        }

        return new Rectangle(this.x, this.y, width, height);
    }
}
