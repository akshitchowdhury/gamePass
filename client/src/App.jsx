import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-950 text-white">
      <h1 className="text-4xl font-bold text-purple-400">Vite + React + Tailwind</h1>
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        className="rounded-lg bg-purple-600 px-6 py-3 font-medium transition hover:bg-purple-500"
      >
        Count is {count}
      </button>
      <p className="text-gray-400">
        Edit <code className="rounded bg-gray-800 px-1.5 py-0.5">src/App.jsx</code> and save to test HMR
      </p>
    </div>
  )
}

export default App
