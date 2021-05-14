/**
 * Only returns {optionalValue} if it isn't null/undefined. Otherwise returns the {defaultValue}
 */
export const coalesce = <T>(optionalValue: T, defaultValue: T): T =>
    optionalValue !== null && optionalValue !== undefined ? optionalValue : defaultValue;
