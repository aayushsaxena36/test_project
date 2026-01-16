import { Router, Request, Response } from 'express';
import { getDbClient } from './db';
import { simulateHeavyEncryption } from './utils/crypto';

const router = Router();

// --- INVENTORY MANAGEMENT ---

// GET /hospital-status
// Returns the current inventory count.
router.get('/hospital-status', async (req: Request, res: Response) => {
    let client;
    try {
        client = await getDbClient();
        const result = await client.query('SELECT count FROM inventory WHERE item_name = $1', ['Pfizer-Batch-A']);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Inventory not found' });
        }
        res.json({ count: result.rows[0].count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (client) await client.end();
    }
});

// POST /reserve-dose
// Accepts a patientId. Checks if stock > 0. Decrements stock. Inserts a reservation.
router.post('/reserve-dose', async (req: Request, res: Response) => {
    const { patientId } = req.body;
    let client;

    try {
        client = await getDbClient();

        // 1. Check stock
        const stockRes = await client.query('SELECT count FROM inventory WHERE item_name = $1', ['Pfizer-Batch-A']);
        const currentStock = stockRes.rows[0].count;

        if (currentStock <= 0) {
            return res.status(400).json({ error: 'No doses available' });
        }

        // 2. Decrement stock
        await client.query('UPDATE inventory SET count = count - 1 WHERE item_name = $1', ['Pfizer-Batch-A']);

        // 3. Create reservation
        await client.query('INSERT INTO reservations (patient_id, status, timestamp) VALUES ($1, $2, NOW())', [patientId, 'CONFIRMED']);

        res.json({ success: true, message: 'Dose reserved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (client) await client.end();
    }
});

// --- VITALS INGESTION ---

// POST /ingest-vitals
// Accepts raw vitals. Performs heavy encryption. Returns success.
router.post('/ingest-vitals', (req: Request, res: Response) => {
    const { vitals } = req.body;

    // Simulate heavy encryption (CPU bound)
    simulateHeavyEncryption();

    // In a real app, we would save the encrypted vitals to DB here

    res.json({ success: true, message: 'Vitals processed' });
});

export default router;
