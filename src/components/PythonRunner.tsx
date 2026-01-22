import { useState, useEffect } from 'react';
import { loadPyodide, type PyodideInterface } from 'pyodide';

export default function PythonRunner() {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [code, setCode] = useState<string>("print('Hello, World!')");
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initPyodide() {
      try {
        const py = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.2/full/"
        });
        setPyodide(py);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading Pyodide:", error);
        setOutput("Failed to load Python environment. Check console for details.");
        setIsLoading(false);
      }
    }
    initPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodide) return;
    setIsRunning(true);
    setOutput(""); 
    try {
      pyodide.setStdout({ batched: (msg) => setOutput((prev) => prev + msg + "\n") });
      pyodide.setStderr({ batched: (msg) => setOutput((prev) => prev + "Error: " + msg + "\n") });

      await pyodide.runPythonAsync(code);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setOutput((prev) => prev + "Runtime Error: " + error.message);
      } else {
        setOutput((prev) => prev + "Runtime Error: Unknown error occurred");
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white font-sans overflow-hidden text-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white flex-shrink-0 z-10">
        <h1 className="text-xl font-semibold text-gray-900 m-0">Python Playground</h1>
        <button 
          onClick={runCode}
          disabled={isRunning || !pyodide}
          className={`
            flex items-center gap-2 px-5 py-2 rounded-md text-sm font-semibold text-white shadow-sm transition-colors duration-200
            ${(isRunning || !pyodide) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}
          `}
        >
          {isRunning ? (
             <>
               <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full inline-block"></span>
               Running...
             </>
          ) : (
            <>
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.25 6.13397C11.9167 6.51887 11.9167 7.48113 11.25 7.86603L1.5 13.4952C0.833333 13.8801 0 13.3989 0 12.6292L0 1.37083C0 0.601132 0.833333 0.119998 1.5 0.504902L11.25 6.13397Z" fill="white"/>
              </svg>
              Run Code
            </>
          )}
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        
        {/* Loading Overlay */}
        {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-20 flex items-center justify-center">
                <span className="text-gray-600 text-lg font-medium">Initializing Python Environment...</span>
            </div>
        )}
        
        {/* Editor Area */}
        <div className="flex-1 flex flex-col relative bg-gray-50">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your Python code here..."
              spellCheck={false}
              className="flex-1 w-full p-6 text-[15px] leading-relaxed font-mono border-none resize-none bg-transparent text-gray-800 outline-none focus:ring-0"
            />
        </div>

        {/* Output Area */}
        <div className="h-[300px] bg-[#1e1e1e] border-t border-[#333] flex flex-col flex-shrink-0">
            <div className="px-4 py-2 bg-[#252526] border-b border-[#333] text-gray-400 text-xs uppercase font-bold tracking-wider flex items-center justify-between">
                <span>Terminal Output</span>
                <span className="opacity-50">ReadOnly</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto font-mono text-sm text-[#d4d4d4] whitespace-pre-wrap">
                {output || <span className="text-gray-600">Run code to see output...</span>}
            </div>
        </div>
      </div>
    </div>
  );
}