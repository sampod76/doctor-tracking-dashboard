export const getChanges = (newValue: any, oldValue: any): any => {
  const normalize = (v: any) => (v === null || v === undefined ? "" : v);
  if (isPrimitive(newValue) || isPrimitive(oldValue)) {
    return normalize(newValue) !== normalize(oldValue) ? newValue : undefined;
  }
  if (Array.isArray(newValue)) {
    if (!Array.isArray(oldValue)) return newValue;
    return JSON.stringify([...newValue].sort()) !== JSON.stringify([...oldValue].sort())
      ? newValue
      : undefined;
  }

  if (typeof newValue === "object") {
    if (!oldValue || typeof oldValue !== "object") return newValue;

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

function isPrimitive(val: any) {
  return val !== Object(val);
}
