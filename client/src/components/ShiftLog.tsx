import { useState } from 'react';

export const ShiftLog = () => {
    const [log, setLog] = useState('');

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-2 text-gray-800">Shift Log (Lag Detector)</h2>
            <p className="text-sm text-gray-600 mb-2">
                Type here to test UI responsiveness. If the text lags, the main thread is blocked.
            </p>
            <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type patient notes here..."
                value={log}
                onChange={(e) => setLog(e.target.value)}
            />
        </div>
    );
};
