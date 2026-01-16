const http = require('http');

const makeRequest = (path, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
};

const runVerification = async () => {
    console.log('🏥 Starting System Verification...\n');

    try {
        // 1. Health Check
        console.log('1. Checking System Status...');
        const status = await makeRequest('/hospital-status');
        console.log('✅ System Online. Current Inventory:', status.count);

        // 2. Reserve a Dose
        console.log('\n2. Testing Vaccine Reservation...');
        const reservation = await makeRequest('/reserve-dose', 'POST', {
            patientId: 'TEST-PATIENT-001',
        });
        console.log('✅ Reservation Successful:', reservation.message);

        // 3. Verify Inventory Decrement
        console.log('\n3. Verifying Inventory Update...');
        const newStatus = await makeRequest('/hospital-status');
        if (newStatus.count === status.count - 1) {
            console.log(`✅ Inventory correctly decremented to ${newStatus.count}`);
        } else {
            throw new Error(`Inventory mismatch! Expected ${status.count - 1}, got ${newStatus.count}`);
        }

        // 4. Test Vitals Ingestion (Latency Check)
        console.log('\n4. Testing Vitals Ingestion (This might take a moment due to encryption)...');
        const start = Date.now();
        await makeRequest('/ingest-vitals', 'POST', {
            vitals: { heartRate: 72, bp: '120/80' },
        });
        const duration = Date.now() - start;
        console.log(`✅ Vitals Processed Successfully (Took ${duration}ms)`);

        console.log('\n✨ ALL SYSTEMS FUNCTIONAL. You are ready to begin.');
    } catch (error) {
        console.error('\n❌ Verification Failed:', error.message);
        process.exit(1);
    }
};

runVerification();
