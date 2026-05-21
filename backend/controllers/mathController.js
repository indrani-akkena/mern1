// Math Expression Evaluator - Project feature
// Supports: +, -, *, /, ^, sqrt(), abs(), sin(), cos(), tan(), log(), factorial()

const evaluateMath = (req, res) => {
  const { expression } = req.body;

  if (!expression || typeof expression !== 'string') {
    return res.status(400).json({ message: 'Expression is required' });
  }

  if (expression.length > 500) {
    return res.status(400).json({ message: 'Expression too long' });
  }

  try {
    const result = safeEvaluate(expression.trim());
    res.json({
      expression: expression.trim(),
      result,
      steps: getSteps(expression.trim())
    });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid expression' });
  }
};

// Safe math evaluator without eval()
function safeEvaluate(expr) {
  // Replace math functions
  let processed = expr
    .replace(/sqrt\(([^)]+)\)/g, (_, n) => Math.sqrt(safeEvaluate(n)))
    .replace(/abs\(([^)]+)\)/g, (_, n) => Math.abs(safeEvaluate(n)))
    .replace(/sin\(([^)]+)\)/g, (_, n) => Math.sin(safeEvaluate(n) * Math.PI / 180))
    .replace(/cos\(([^)]+)\)/g, (_, n) => Math.cos(safeEvaluate(n) * Math.PI / 180))
    .replace(/tan\(([^)]+)\)/g, (_, n) => Math.tan(safeEvaluate(n) * Math.PI / 180))
    .replace(/log\(([^)]+)\)/g, (_, n) => Math.log10(safeEvaluate(n)))
    .replace(/ln\(([^)]+)\)/g, (_, n) => Math.log(safeEvaluate(n)))
    .replace(/factorial\(([^)]+)\)/g, (_, n) => factorial(Math.round(safeEvaluate(n))))
    .replace(/pi/gi, Math.PI)
    .replace(/e(?![0-9])/g, Math.E);

  // Validate: only numbers, operators, parens, dots, spaces
  if (!/^[\d\s+\-*/^().]+$/.test(processed)) {
    throw new Error('Invalid characters in expression');
  }

  return parseExpression(processed);
}

function factorial(n) {
  if (n < 0) throw new Error('Factorial of negative number is undefined');
  if (n > 20) throw new Error('Factorial input too large (max 20)');
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

// Recursive descent parser
function parseExpression(expr) {
  const tokens = tokenize(expr);
  let pos = 0;

  function peek() { return tokens[pos]; }
  function consume() { return tokens[pos++]; }

  function parseE() {
    let left = parseT();
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const right = parseT();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseT() {
    let left = parseF();
    while (peek() === '*' || peek() === '/') {
      const op = consume();
      const right = parseF();
      if (op === '/' && right === 0) throw new Error('Division by zero');
      left = op === '*' ? left * right : left / right;
    }
    return left;
  }

  function parseF() {
    let base = parseP();
    if (peek() === '^') {
      consume();
      const exp = parseF();
      base = Math.pow(base, exp);
    }
    return base;
  }

  function parseP() {
    if (peek() === '(') {
      consume();
      const val = parseE();
      if (consume() !== ')') throw new Error('Missing closing parenthesis');
      return val;
    }
    if (peek() === '-') {
      consume();
      return -parseP();
    }
    const tok = consume();
    const num = parseFloat(tok);
    if (isNaN(num)) throw new Error(`Invalid token: ${tok}`);
    return num;
  }

  const result = parseE();
  if (pos < tokens.length) throw new Error('Unexpected token: ' + tokens[pos]);
  return result;
}

function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    if (/\s/.test(expr[i])) { i++; continue; }
    if (/[\d.]/.test(expr[i])) {
      let num = '';
      while (i < expr.length && /[\d.]/.test(expr[i])) num += expr[i++];
      tokens.push(num);
    } else {
      tokens.push(expr[i++]);
    }
  }
  return tokens;
}

function getSteps(expr) {
  const steps = [];
  steps.push(`Input expression: ${expr}`);

  if (expr.includes('sqrt')) steps.push('Applying square root function');
  if (expr.includes('sin') || expr.includes('cos') || expr.includes('tan')) steps.push('Applying trigonometric function (in degrees)');
  if (expr.includes('^')) steps.push('Evaluating exponentiation (^)');
  if (expr.includes('(')) steps.push('Evaluating parentheses first');
  if (expr.includes('*') || expr.includes('/')) steps.push('Applying multiplication/division (left to right)');
  if (expr.includes('+') || expr.includes('-')) steps.push('Applying addition/subtraction (left to right)');

  return steps;
}

// History (in-memory)
const history = [];

const getHistory = (req, res) => {
  res.json(history.slice(-20).reverse());
};

const addToHistory = (req, res, next) => {
  const { expression } = req.body;
  res.on('finish', () => {
    if (res.statusCode === 200) {
      history.push({ expression, timestamp: new Date() });
      if (history.length > 100) history.shift();
    }
  });
  next();
};

module.exports = { evaluateMath, getHistory, addToHistory };
