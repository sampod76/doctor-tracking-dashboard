/* eslint-disable @typescript-eslint/no-explicit-any */

export class ObjectCleaner {
    private target: { [key: string]: any };

    constructor(target: { [key: string]: any }) {
        this.target = target;
    }

    /**
     * Starts the cleaning process.
     */
    public clean(): void {
        this.target = this._deepClean(this.target);
    }

    /**
     * Get cleaned result.
     */
    public getResult(): { [key: string]: any } {
        return this.target;
    }

    /**
     * Recursive cleaning utility
     */
    private _deepClean(obj: any): any {
        if (Array.isArray(obj)) {
            const cleanedArray = obj
                .map((item) => this._deepClean(item))
                .filter((item) => !this._isRemovable(item));
            return cleanedArray.length > 0 ? cleanedArray : undefined;
        }

        if (obj !== null && typeof obj === "object") {
            const cleanedObj: any = {};
            for (const key in obj) {
                const value = this._deepClean(obj[key]);
                if (!this._isRemovable(value)) {
                    cleanedObj[key] = value;
                }
            }
            return Object.keys(cleanedObj).length > 0 ? cleanedObj : undefined;
        }

        return obj;
    }

    /**
     * Determine if a value should be removed
     */
    private _isRemovable(value: any): boolean {
        return (
            value === null ||
            value === undefined ||
            (typeof value === "object" && Object.keys(value).length === 0) ||
            (Array.isArray(value) && value.length === 0)
        );
    }
}


export function cleanObject<T = any>(
  obj: { [key: string]: any },
): T {
  const cleaner = new ObjectCleaner(obj);
  cleaner.clean();
  return cleaner.getResult() as T;
}
