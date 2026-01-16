import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import router from './routes';
import { getDbClient } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, specify exact origins
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Pandemic Response Unit API is running. Access /hospital-status for inventory.' });
});

app.use('/', router);

// Initialize DB table on start (for demo purposes)
const initDb = async () => {
  let client;
  try {
    client = await getDbClient();
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        item_name VARCHAR(255) UNIQUE NOT NULL,
        count INTEGER NOT NULL,
        version INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS reservations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW()
      );

      -- Reset inventory for a clean start
      INSERT INTO inventory (item_name, count) 
      VALUES ('Pfizer-Batch-A', 500) 
      ON CONFLICT (item_name) 
      DO UPDATE SET count = 500;
      
      -- Clear reservations
      DELETE FROM reservations;
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Database initialization failed:', err);
  } finally {
    if (client) await client.end();
  }
};

// WebSocket: Patient Vitals Stream
// Simulates real-time patient monitoring data for 50 patients
interface PatientVitals {
  id: string;
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  temperature: number;
  timestamp: number;
}

const generatePatientVitals = (patientId: string): PatientVitals => {
  return {
    id: patientId,
    heartRate: 60 + Math.floor(Math.random() * 60), // 60-120 bpm
    bloodPressureSystolic: 100 + Math.floor(Math.random() * 40), // 100-140
    bloodPressureDiastolic: 60 + Math.floor(Math.random() * 30), // 60-90
    oxygenSaturation: 90 + Math.floor(Math.random() * 10), // 90-100%
    respiratoryRate: 12 + Math.floor(Math.random() * 8), // 12-20 breaths/min
    temperature: 36.5 + Math.random() * 2, // 36.5-38.5°C
    timestamp: Date.now()
  };
};

io.on('connection', (socket: Socket) => {
  console.log('Client connected:', socket.id);

  // Send initial batch of patient data (3000 patients)
  const initialPatients: PatientVitals[] = [];
  for (let i = 0; i < 3000; i++) {
    initialPatients.push(generatePatientVitals(`P-${String(i + 1).padStart(4, '0')}`));
  }

  socket.emit('initial_patients', initialPatients);

  // Critical patients list
  const criticalPatientIds = ['P-0015', 'P-0019', 'P-0023', 'P-0045', 'P-0049'];
  let currentCriticalIndex = 0;

  // Broadcast updated vitals every 1 second
  // We only update a subset of patients and not all patients. 
  const interval = setInterval(() => {
    const updates: PatientVitals[] = [];

    // 1. Always update the "Critical" rotation
    // We rotate through 2 critical patients every 10 seconds (simulated by just picking 2 based on time)
    const isCriticalPhase = Math.floor(Date.now() / 10000) % 2 === 0;

    criticalPatientIds.forEach((id, index) => {
      let vital = generatePatientVitals(id);

      // Make 2 of them critical every 10 seconds
      if (index === currentCriticalIndex || index === (currentCriticalIndex + 1) % criticalPatientIds.length) {
        vital.heartRate = 130 + Math.floor(Math.random() * 20); // High HR
        vital.oxygenSaturation = 85 + Math.floor(Math.random() * 5); // Low SpO2
        vital.bloodPressureSystolic = 80 + Math.floor(Math.random() * 10); // Low BP
      }
      updates.push(vital);
    });

    // Rotate critical patients every 10 seconds
    if (Date.now() % 10000 < 1000) {
      currentCriticalIndex = (currentCriticalIndex + 1) % criticalPatientIds.length;
    }

    // 2. Update ~300 random other patients
    for (let i = 0; i < 300; i++) {
      const randomId = Math.floor(Math.random() * 3000) + 1;
      const id = `P-${String(randomId).padStart(4, '0')}`;
      // Avoid duplicates if we hit a critical one
      if (!criticalPatientIds.includes(id)) {
        updates.push(generatePatientVitals(id));
      }
    }

    socket.emit('vitals_update', updates);
  }, 1000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(interval);
  });
});

httpServer.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready for patient vitals streaming`);
  await initDb();
});
