import React, { useState, useRef, useEffect } from 'react';
import API from '../utils/api';

const BUTTONS = [
  ['C', '(', ')', '^'],
  ['7', '8', '9', '/'],
  ['4', '5', '6', '*'],
  ['1', '2', '3', '-'],
  ['0', '.', '=', '+'],
  ['sqrt(', 'sin(', 'cos(', 'tan('],
  ['log(', 'ln(', 'abs(', 'factorial('],
  ['pi', 'e', '⌫', ''],
];

const EXAMPLES = [
  { expr: '2 + 3 * 4', label: 'Basic arithmetic' },
  { expr: '(10 + 5) / 3', label: 'Parentheses' },
  { expr: '2 ^ 10', label: 'Exponentiation' },
  { expr: 'sqrt(144)', label: 'Square root' },
  { expr: 'sin(30)', label: 'Sine (degrees)' },
  { expr: 'log(1000)', label: 'Logarithm base 10' },
  { expr: 'factorial(6)', label: 'Factorial' },
  { expr: 'pi * 5 ^ 2', label: 'Circle area (r=5)' },
];

const MathPage = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult]         = useState(null);
  const [steps, setSteps]           = useState([]);
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const inputRef = useRef(null);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await API.get('/math/history');
      setHistory(data);
    } catch (_) {}
  };

  const evaluate = async (expr = expression) => {
    if (!expr.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSteps([]);
    try {
      const { data } = await API.post('/math/evaluate', { expression: expr });
      setResult(data.result);
      setSteps(data.steps || []);
      setHistory(prev => [{ expression: expr, result: data.result, timestamp: new Date() }, ...prev.slice(0, 19)]);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid expression');
    } finally {
      setLoading(false);
    }
  };

  const handleButton = (val) => {
    if (val === '') return;
    if (val === 'C') { setExpression(''); setResult(null); setError(''); setSteps([]); return; }
    if (val === '=') { evaluate(); return; }
    if (val === '⌫') { setExpression(prev => prev.slice(0, -1)); return; }
    setExpression(prev => prev + val);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') evaluate();
  };

  const BUTTON_STYLES = {
    '=': 'bg-blue-600 hover:bg-blue-700 text-white font-bold',
    'C': 'bg-red-500 hover:bg-red-600 text-white font-bold',
    '⌫': 'bg-orange-500 hover:bg-orange-600 text-white',
    '+': 'bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold',
    '-': 'bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold',
    '*': 'bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold',
    '/': 'bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold',
    '^': 'bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold',
    '(': 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    ')': 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  };

  const getButtonStyle = (val) => {
    if (BUTTON_STYLES[val]) return BUTTON_STYLES[val];
    if (/^\d$/.test(val) || val === '.') return 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-semibold';
    return 'bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4">
          <span className="text-white text-2xl">🧮</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Math Expression Evaluator</h1>
        <p className="text-gray-500 mt-2">Evaluate complex expressions — supports trig, logs, factorial, and more</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calculator */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            {/* Display */}
            <div className="bg-gray-900 rounded-2xl p-5 mb-5">
              <p className="text-gray-400 text-xs mb-1 font-mono">Expression</p>
              <input
                ref={inputRef}
                value={expression}
                onChange={e => { setExpression(e.target.value); setError(''); setResult(null); }}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-white text-xl font-mono focus:outline-none placeholder-gray-600"
                placeholder="Enter expression..."
              />
              <div className="mt-3 min-h-[2.5rem] flex items-center">
                {loading && <span className="text-blue-400 text-sm animate-pulse">Calculating...</span>}
                {error && <span className="text-red-400 text-sm font-mono">⚠ {error}</span>}
                {result !== null && !error && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-400 text-sm">= </span>
                    <span className="text-green-400 text-3xl font-bold font-mono">
                      {typeof result === 'number'
                        ? Number.isInteger(result) ? result.toLocaleString() : parseFloat(result.toFixed(8)).toLocaleString()
                        : result}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Button Grid */}
            <div className="grid grid-cols-4 gap-2">
              {BUTTONS.flat().map((btn, i) => (
                btn === '' ? <div key={i} /> :
                <button
                  key={i}
                  onClick={() => handleButton(btn)}
                  className={`p-3 rounded-xl text-sm transition-all duration-100 active:scale-95 ${getButtonStyle(btn)}`}
                >
                  {btn}
                </button>
              ))}
            </div>

            {/* Evaluate Button */}
            <button
              onClick={() => evaluate()}
              disabled={loading || !expression.trim()}
              className="w-full mt-3 btn-primary py-3 text-base disabled:opacity-50"
            >
              {loading ? 'Evaluating...' : '= Calculate'}
            </button>

            {/* Steps */}
            {steps.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-semibold text-blue-800 mb-2">📝 Evaluation Steps:</p>
                <ol className="space-y-1">
                  {steps.map((s, i) => (
                    <li key={i} className="text-xs text-blue-700 flex gap-2">
                      <span className="text-blue-400 font-mono">{i + 1}.</span> {s}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Examples */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3">💡 Examples</h3>
            <div className="space-y-2">
              {EXAMPLES.map(ex => (
                <button
                  key={ex.expr}
                  onClick={() => { setExpression(ex.expr); setError(''); setResult(null); evaluate(ex.expr); }}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <p className="text-xs font-mono text-blue-600 font-semibold">{ex.expr}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ex.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Supported Functions */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3">📖 Functions</h3>
            <div className="space-y-1.5 text-xs text-gray-600">
              {[
                ['sqrt(x)', 'Square root'],
                ['sin(x)', 'Sine (degrees)'],
                ['cos(x)', 'Cosine (degrees)'],
                ['tan(x)', 'Tangent (degrees)'],
                ['log(x)', 'Log base 10'],
                ['ln(x)', 'Natural log'],
                ['abs(x)', 'Absolute value'],
                ['factorial(x)', 'Factorial (x ≤ 20)'],
                ['pi', 'π ≈ 3.14159...'],
                ['e', 'Euler\'s number'],
                ['x ^ y', 'Exponentiation'],
              ].map(([fn, desc]) => (
                <div key={fn} className="flex justify-between">
                  <code className="text-purple-700 font-mono">{fn}</code>
                  <span className="text-gray-400">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">🕓 History</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.map((h, i) => (
                  <button key={i} onClick={() => { setExpression(h.expression); setResult(h.result); setSteps([]); }}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-50 border border-gray-100">
                    <p className="text-xs font-mono text-gray-600 truncate">{h.expression}</p>
                    <p className="text-xs font-bold text-blue-600">= {typeof h.result === 'number' ? parseFloat(h.result?.toFixed(6)) : h.result}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MathPage;
