import { Dashboard } from './components/Dashboard';
import { ShiftLog } from './components/ShiftLog';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pandemic Response Unit</h1>
          <p className="mt-2 text-gray-600">Central Monitoring Station</p>
        </header>

        <main>
          <ShiftLog />
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App;
