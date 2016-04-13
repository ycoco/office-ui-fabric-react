// OneDrive:CoverageThreshold(100)

export default class CircularBuffer<DataType> {
    private _size: number;
    private _length: number = 0;
    private _head: number = -1;
    private _buffer: Array<DataType>;

    constructor(size: number) {
        if (size <= 0) {
            throw new Error("Size must be positive");
        }

        this._size = size;
        this._buffer = new Array<DataType>(size);
    }

    public push(item: DataType) {
        if (this._length < this._size) {
            this._length++;
        }

        this._head++;
        if (this._head === this._size) {
            this._head = 0;
        }

        this._buffer[this._head] = item;
    }

    public popOldest(): DataType {
        if (this._length === 0) {
            return null;
        }

        var tail = (this._head - this._length + 1 + this._size) % this._size;

        this._length--;

        return this._buffer[tail];
    }
}
