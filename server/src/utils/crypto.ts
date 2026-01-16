import crypto from 'crypto';

/**
 * Simulates a heavy CPU-bound task (e.g., encryption).
 * This function is SYNCHRONOUS.
 * 
 * @returns {void}
 */
export const simulateHeavyEncryption = (): void => {
    // PBKDF2 with high iterations to simulate CPU load
    // This takes roughly 1-2 seconds depending on the machine
    crypto.pbkdf2Sync('secret', 'salt', 500000, 64, 'sha512');
};
