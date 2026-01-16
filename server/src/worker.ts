import { parentPort, workerData } from "node:worker_threads";
import { simulateHeavyEncryption } from "./utils/crypto";


try {
  const result = simulateHeavyEncryption()
  parentPort?.postMessage({ success: true, result });
} catch (err:any) {
  parentPort?.postMessage({ success: false, error: err.message });
}