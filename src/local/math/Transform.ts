
import Point = require('./Point');
import ISize = require('./ISize');
import Rectangle = require('./Rectangle');

/**
 * Stores an affine transform with a translate component and a scale component.
 * 
 * The effective transformation matrix is the result of right-multiplying the
 * scale matrix by the translation matrix.
 * 
 * scale =
 * [ s, 0, 0 ]
 * [ 0, s, 0 ]
 * [ 0, 0, 1 ]
 * 
 * translate =
 * [ 1, 0, dx ]
 * [ 0, 1, dy ]
 * [ 0, 0, 1  ]
 * 
 * this = scale * translate =
 * [ s, 0, dx ]
 * [ 0, s, dy ]
 * [ 0, 0, 1  ]
 */
class Transform {
    /**
     * Gets the identity transform.
     */
    public static IDENTITY = new Transform();

    /**
     * Gets the translate component of the transform.
     */
    public translate: Point;

    /**
     * Gets the scale component of the transform.
     */
    public scale: number;

    constructor(translate: Point = new Point(), scale: number = 1) {
        this.translate = translate;
        this.scale = scale;
    }

    /**
     * Determines whether or not two transforms are considered equal.
     */
    public static areEqual(transform1: Transform, transform2: Transform, tolerance: number = 1E-6): boolean {
        return Point.areEqual(transform1.translate, transform2.translate, tolerance) && Math.abs(Math.log(transform1.scale / transform2.scale)) < tolerance;
    }

    /**
     * Calculates the transform resulting from zooming with a given scale
     * at the given center, adjusted for the current projected origin.
     */
    public static zoom(origin: Point, center: Point, scale: number) {
        return new Transform(origin.subtract(center).scale(scale - 1), scale);
    }

    /**
     * Calculates the translate w.r.t origin given bounds and 2 points, topLeft and bottomRight.
     */
    public static centerWithinBounds(bounds: ISize, topLeftPoint: Point, bottomRightPoint: Point): Transform {
        return new Transform(new Rectangle(Point.ORIGIN, bounds).getCenter().subtract(Point.getCenter([topLeftPoint, bottomRightPoint])));
    }

    /**
     * Calculates the point which is the result of multiplying this transform
     * by the given point.
     * 
     * this * point =
     * [ s * x + dx ]
     * [ s * y + dy ]
     */
    public apply(point: Point): Point {
        return point.scale(this.scale).add(this.translate);
    }

    /**
     * Calculates the transform which is the result of multiplying this transform
     * by the given increment transform.
     * 
     * this * increment =
     * [ s * is, 0     , dx + s * idx ]
     * [ 0     , s * is, dy + s * idy ]
     * [ 0     , 0     , 1            ]
     */
    public multiply(increment: Transform): Transform {
        return new Transform(this.translate.add(increment.translate.scale(this.scale)), this.scale * increment.scale);
    }

    /**
     * [ 1 / s, 0    , -dx ]
     * [ 0    , 1 / s, -dy ]
     * [ 0    , 0    , 1   ]
     */
    public invert(): Transform {
        return new Transform(this.translate.scale(-1 / this.scale), 1 / this.scale);
    }
}

export = Transform;
