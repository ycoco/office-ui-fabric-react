/**
 * Immutable structure representing a 2D point.
 */
class Point {
    /**
     * The origin of a 2D plane.
     */
    public static ORIGIN = new Point();

    /**
     * The x coordinate of the point.
     */
    public x: number;

    /**
     * The y coordinate of the point.
     */
    public y: number;

    constructor();
    constructor(point: Point);
    constructor(x: number, y: number);
    constructor(xOrPoint: number | Point = 0, y: number = 0) {
        if (<any>xOrPoint instanceof Point) {
            var point = <Point>xOrPoint;

            this.x = point.x;
            this.y = point.y;
        } else {
            this.x = <number>xOrPoint;
            this.y = <number>y;
        }
    }

    public static areEqual(point1: Point, point2: Point, tolerance: number = 1E-6): boolean {
        return Math.abs(point1.x - point2.x) < tolerance && Math.abs(point1.y - point2.y) < tolerance;
    }

    /**
     * gets the center of points.
     */
    public static getCenter(points: Point[]): Point {
        return points.reduce((p1, p2) => p1.add(p2), Point.ORIGIN).scale(1 / points.length);
    }

    /**
     * Multiplies a point by a constant, producing a scaled point.
     */
    public scale(factor: number): Point {
        return new Point(this.x * factor, this.y * factor);
    }

    /**
     * Adds two points, creating a translated point.
     */
    public add(offset: Point): Point {
        return new Point(this.x + offset.x, this.y + offset.y);
    }

    /**
     * Subtracts two points, creating a translated point.
     */
    public subtract(offset: Point): Point {
        return new Point(this.x - offset.x, this.y - offset.y);
    }

    /**
     * Determines the distance from one point to another.
     */
    public distance(target: Point): number {
        var dx = this.x - target.x;
        var dy = this.y - target.y;

        return Math.sqrt((dx * dx) + (dy * dy));
    }

    /**
     * Negates a point, creating a point reflected across the origin.
     */
    public negate(): Point {
        return new Point(-this.x, -this.y);
    }

    /**
     * Takes the absolute value of a point, getting its distance from the origin.
     */
    public abs(): number {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    /**
     * Gets the unit vector for a point.
     */
    public unit(): Point {
        var abs = this.abs();

        return this.scale(abs && (1 / abs) || 0);
    }

    /**
     * Represents this point as a string.
     */
    public toString(): string {
        return '[Point ' + this.x + ', ' + this.y + ']';
    }
}

export = Point;
