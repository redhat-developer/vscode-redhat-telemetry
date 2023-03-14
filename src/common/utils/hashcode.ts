//See https://stackoverflow.com/a/8076436/753170
export function hashCode(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + code;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}


const cache = new Map<string, number>();

export function numValue(value: string): number {
    let num = cache.get(value);
    if (num) {
        return num;
    }
    const hash = Math.abs(hashCode(value)).toString();
    const x = Math.min(2, hash.length);
    num = parseFloat(hash.substring(hash.length - x)) / 100;
    cache.set(value, num);
    return num;
}
