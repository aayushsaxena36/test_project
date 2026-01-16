import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

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

// Dashboard component for monitoring patient vitals
export const Dashboard = () => {
    const [patients, setPatients] = useState<PatientVitals[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect to WebSocket server
        const socket: Socket = io('http://localhost:3000');

        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
            setIsConnected(false);
        });

        // Receive initial patient data
        socket.on('initial_patients', (initialPatients: PatientVitals[]) => {
            console.log('Received initial patients:', initialPatients.length);
            setPatients(initialPatients);
        });

        // Receive vitals updates
        socket.on('vitals_update', (updates: PatientVitals[]) => {
            setPatients(prevPatients => {
                const newPatients = [...prevPatients];

                updates.forEach(update => {
                    const index = newPatients.findIndex(p => p.id === update.id);
                    if (index !== -1) {
                        newPatients[index] = update;
                    }
                });

                return newPatients;
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const getVitalStatus = (vital: string, value: number): string => {
        switch (vital) {
            case 'heartRate':
                if (value < 60 || value > 100) return 'text-red-600';
                return 'text-gray-800';
            case 'oxygenSaturation':
                if (value < 95) return 'text-red-600';
                return 'text-gray-800';
            case 'bloodPressure':
                const systolic = value;
                if (systolic < 90 || systolic > 140) return 'text-red-600';
                return 'text-gray-800';
            case 'temperature':
                if (value < 36.5 || value > 37.5) return 'text-yellow-600';
                if (value > 38) return 'text-red-600';
                return 'text-gray-800';
            default:
                return 'text-gray-800';
        }
    };

    return (
        <div className="bg-gray-100 p-6 min-h-screen">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-100 z-10 py-2">
                <h2 className="text-2xl font-bold text-gray-800">ICU Live Monitor ({patients.length} Patients)</h2>
                <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isConnected ? 'SYSTEM ONLINE' : 'DISCONNECTED'}
                </div>
            </div>

            <div className="space-y-3">
                {patients.map((patient) => (
                    <div key={patient.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-bold text-gray-900">{patient.id}</h3>
                            <span className="text-xs text-gray-500">
                                {new Date(patient.timestamp).toLocaleTimeString()}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {/* Heart Rate */}
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="text-xs text-gray-500 uppercase mb-1">Heart Rate</div>
                                <div className={`text-xl font-mono font-bold ${getVitalStatus('heartRate', patient.heartRate)}`}>
                                    {patient.heartRate}
                                    <span className="text-xs font-normal text-gray-400 ml-1">bpm</span>
                                </div>
                            </div>

                            {/* Blood Pressure */}
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="text-xs text-gray-500 uppercase mb-1">Blood Pressure</div>
                                <div className={`text-xl font-mono font-bold ${getVitalStatus('bloodPressure', patient.bloodPressureSystolic)}`}>
                                    {patient.bloodPressureSystolic}/{patient.bloodPressureDiastolic}
                                    <span className="text-xs font-normal text-gray-400 ml-1">mmHg</span>
                                </div>
                            </div>

                            {/* Oxygen Saturation */}
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="text-xs text-gray-500 uppercase mb-1">SpO₂</div>
                                <div className={`text-xl font-mono font-bold ${getVitalStatus('oxygenSaturation', patient.oxygenSaturation)}`}>
                                    {patient.oxygenSaturation}
                                    <span className="text-xs font-normal text-gray-400 ml-1">%</span>
                                </div>
                            </div>

                            {/* Respiratory Rate */}
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="text-xs text-gray-500 uppercase mb-1">Resp. Rate</div>
                                <div className="text-xl font-mono font-bold text-gray-800">
                                    {patient.respiratoryRate}
                                    <span className="text-xs font-normal text-gray-400 ml-1">/min</span>
                                </div>
                            </div>

                            {/* Temperature */}
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="text-xs text-gray-500 uppercase mb-1">Temperature</div>
                                <div className={`text-xl font-mono font-bold ${getVitalStatus('temperature', patient.temperature)}`}>
                                    {patient.temperature.toFixed(1)}
                                    <span className="text-xs font-normal text-gray-400 ml-1">°C</span>
                                </div>
                            </div>

                            {/* Status Summary */}
                            <div className="bg-gray-50 p-3 rounded flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-xs text-gray-500 uppercase mb-1">Status</div>
                                    <div className={`text-sm font-semibold px-3 py-1 rounded-full ${patient.oxygenSaturation < 95 || patient.heartRate > 100 || patient.heartRate < 60
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {patient.oxygenSaturation < 95 || patient.heartRate > 100 || patient.heartRate < 60 ? 'CRITICAL' : 'STABLE'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sparkline - History Visualization (Heavy Render) */}
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-400 mb-1">Vital History (Last 10m)</div>
                            <div className="h-12 flex items-end space-x-1">
                                {[...Array(20)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-full bg-blue-100 rounded-t"
                                        style={{
                                            height: `${30 + Math.random() * 70}%`,
                                            opacity: 0.5 + (i / 40)
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
