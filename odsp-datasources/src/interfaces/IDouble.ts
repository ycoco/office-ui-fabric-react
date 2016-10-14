/**
 * Represents a 64-bit integer.
 */
export interface IDouble {
    /**
     * Low 32 bits. Will be converted to a 32-bit signed integer for bitwise operations,
     * so the max safe value (to avoid the sign bit) is 0x7FFFFFFF.
     */
    Low: number;
    /**
     * High 32 bits. Will be converted to a 32-bit signed integer for bitwise operations,
     * so the max safe value (to avoid the sign bit) is 0x7FFFFFFF.
     */
    High: number;
}

export default IDouble;
