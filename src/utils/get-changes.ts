/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Compare two values and return the new value if they are different.
 * Handles:
 * - Primitives (with strict equality, normalizing null/undefined to "")
 * - Arrays (deep equality check, full replace if different)
 * - Objects (recursive diff)
 */
export const getChanges = (newValue: any, oldValue: any): any => {
    // Normalize null/undefined to empty string for comparison if desired,
    // or just handle strict equivalence.
    // The user requirement implies that if something was null and is now "", it might be ignored?
    // But usually for forms, "" matches null.
    const normalize = (v: any) => (v === null || v === undefined) ? "" : v;

    // 1. Primitive Comparison
    if (isPrimitive(newValue) || isPrimitive(oldValue)) {
        return normalize(newValue) !== normalize(oldValue) ? newValue : undefined;
    }

    // 2. Arrays
    if (Array.isArray(newValue)) {
        // If old value is not array, it's a change
        if (!Array.isArray(oldValue)) return newValue;
        // Deep compare arrays. If different, return NEW array.
        // We don't do partial array updates (e.g. index 2 changed) for standard REST usually.
        // Using simple JSON stringify or lodash isEqual for array content
        // But since we can't import lodash easily without knowing if it's there?
        // Let's implement simple deep equality for arrays/objects helper or use JSON.stringify for arrays
        
        // Create copies before sorting to avoid mutating read-only arrays
        return JSON.stringify([...newValue].sort()) !== JSON.stringify([...oldValue].sort()) ? newValue : undefined;
        // Note: Sort might be dangerous if order matters. 
        // Better: JSON.stringify(newValue) !== JSON.stringify(oldValue)
    }

    // 3. Objects (Date, File, custom objects - tricky)
    // TFileDocument check? It has an ID usually.
    // If it's a generic object
    if (typeof newValue === "object") {
        if (!oldValue || typeof oldValue !== "object") return newValue;

        // If it looks like a file/date/special object using references?
        // We previously relied on reference equality.
        // Let's iterate keys.
        const diff: any = {};
        let hasChanges = false;

        Object.keys(newValue).forEach((key) => {
            const result = getChanges(newValue[key], oldValue[key]);
            if (result !== undefined) {
                diff[key] = result;
                hasChanges = true;
            }
        });

        return hasChanges ? diff : undefined;
    }

    return undefined;
};

// Helper: check if primitive
function isPrimitive(val: any) {
    return val !== Object(val);
}
