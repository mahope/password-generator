"use client";

import { useState, useCallback, useEffect } from "react";

const CHAR_SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  danish: "æøåÆØÅ",
};

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  feedback: string[];
}

function analyzePassword(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (password.length < 8) feedback.push("Brug mindst 8 tegn");

  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  const variety = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  if (variety >= 3) score++;
  if (variety < 3) feedback.push("Brug en blanding af store/små bogstaver, tal og symboler");

  // Common patterns (bad)
  if (/123|abc|qwerty|password|admin/i.test(password)) {
    score = Math.max(0, score - 1);
    feedback.push("Undgå almindelige mønstre");
  }

  // Repeated characters
  if (/(.)\1{2,}/.test(password)) {
    feedback.push("Undgå gentagne tegn");
  }

  const labels = ["Meget svag", "Svag", "Okay", "Stærk", "Meget stærk"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];

  return {
    score: Math.min(4, score),
    label: labels[Math.min(4, score)],
    color: colors[Math.min(4, score)],
    feedback: feedback.length > 0 ? feedback : ["Godt kodeord! 👍"],
  };
}

function generatePassword(
  length: number,
  useLowercase: boolean,
  useUppercase: boolean,
  useNumbers: boolean,
  useSymbols: boolean,
  useDanish: boolean
): string {
  let chars = "";
  if (useLowercase) chars += CHAR_SETS.lowercase;
  if (useUppercase) chars += CHAR_SETS.uppercase;
  if (useNumbers) chars += CHAR_SETS.numbers;
  if (useSymbols) chars += CHAR_SETS.symbols;
  if (useDanish) chars += CHAR_SETS.danish;

  if (chars.length === 0) {
    chars = CHAR_SETS.lowercase + CHAR_SETS.uppercase + CHAR_SETS.numbers;
  }

  // Use crypto API for secure randomness
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }

  return password;
}

export default function PasswordGenerator() {
  const [password, setPassword] = useState<string>("");
  const [length, setLength] = useState<number>(16);
  const [useLowercase, setUseLowercase] = useState<boolean>(true);
  const [useUppercase, setUseUppercase] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [useDanish, setUseDanish] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);

  const strength = analyzePassword(password);

  const generate = useCallback(() => {
    const newPassword = generatePassword(
      length,
      useLowercase,
      useUppercase,
      useNumbers,
      useSymbols,
      useDanish
    );
    setPassword(newPassword);
    setCopied(false);
  }, [length, useLowercase, useUppercase, useNumbers, useSymbols, useDanish]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      // Add to history
      setHistory((prev) => [password, ...prev.slice(0, 4)]);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Kunne ikke kopiere til udklipsholder");
    }
  };

  // Generate on mount and when settings change
  useEffect(() => {
    generate();
  }, [generate]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Kodeordsgenerator 🔐
          </h1>
          <p className="mt-2 text-gray-600">
            Opret stærke, sikre kodeord - gratis og direkte i din browser
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main password display */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="relative">
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 pr-24 text-2xl font-mono bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Dit kodeord"
            />
            <button
              onClick={copyToClipboard}
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg font-medium transition-all ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              {copied ? "✓ Kopieret!" : "Kopiér"}
            </button>
          </div>

          {/* Strength meter */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Styrke:</span>
              <span className="font-medium">{strength.label}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${strength.color} transition-all duration-300`}
                style={{ width: `${((strength.score + 1) / 5) * 100}%` }}
              />
            </div>
            {strength.feedback.length > 0 && strength.score < 4 && (
              <p className="mt-2 text-sm text-gray-500">
                💡 {strength.feedback[0]}
              </p>
            )}
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            className="mt-6 w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all text-lg shadow-lg"
          >
            🎲 Generér nyt kodeord
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ⚙️ Indstillinger
            </h2>

            {/* Length slider */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Længde
                </label>
                <span className="text-sm font-bold text-purple-600">{length} tegn</span>
              </div>
              <input
                type="range"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                min={6}
                max={64}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>6</span>
                <span>64</span>
              </div>
            </div>

            {/* Character options */}
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={useLowercase}
                    onChange={(e) => setUseLowercase(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Små bogstaver (a-z)</span>
                </div>
                <code className="text-xs text-gray-400">abc</code>
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={useUppercase}
                    onChange={(e) => setUseUppercase(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Store bogstaver (A-Z)</span>
                </div>
                <code className="text-xs text-gray-400">ABC</code>
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={useNumbers}
                    onChange={(e) => setUseNumbers(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Tal (0-9)</span>
                </div>
                <code className="text-xs text-gray-400">123</code>
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={useSymbols}
                    onChange={(e) => setUseSymbols(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Symboler</span>
                </div>
                <code className="text-xs text-gray-400">!@#</code>
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={useDanish}
                    onChange={(e) => setUseDanish(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Danske bogstaver</span>
                </div>
                <code className="text-xs text-gray-400">æøå</code>
              </label>
            </div>
          </div>

          {/* History & Info */}
          <div className="space-y-6">
            {/* History */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  📋 Seneste kodeord
                </h2>
                <div className="space-y-2">
                  {history.map((pwd, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <code className="text-sm font-mono truncate flex-1 mr-2">
                        {pwd}
                      </code>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(pwd);
                        }}
                        className="text-purple-500 hover:text-purple-700 text-sm"
                      >
                        Kopiér
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-purple-50 rounded-xl p-4 text-sm text-purple-800">
              <p className="font-medium">💡 Tips til sikre kodeord:</p>
              <ul className="mt-2 space-y-1 text-purple-700">
                <li>• Brug mindst 12 tegn</li>
                <li>• Bland store/små bogstaver, tal og symboler</li>
                <li>• Brug unikke kodeord til hver konto</li>
                <li>• Overvej en password manager</li>
              </ul>
            </div>

            {/* Security note */}
            <div className="bg-green-50 rounded-xl p-4 text-sm text-green-800">
              <p className="font-medium">🔒 Sikkerhed:</p>
              <ul className="mt-2 space-y-1 text-green-700">
                <li>• Kodeord genereres lokalt i din browser</li>
                <li>• Intet sendes til en server</li>
                <li>• Vi bruger kryptografisk sikker randomisering</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <section className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Hvorfor bruge en kodeordsgenerator?
          </h2>
          <div className="prose max-w-none text-gray-600">
            <p>
              Et stærkt kodeord er din første forsvarslinje mod hackere og identitetstyveri. 
              Mange danskere bruger desværre svage kodeord som &quot;123456&quot; eller &quot;password&quot;, 
              hvilket gør deres konti sårbare.
            </p>
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
              Hvad gør et kodeord sikkert?
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Længde:</strong> Mindst 12 tegn, gerne flere</li>
              <li><strong>Kompleksitet:</strong> Brug både store og små bogstaver, tal og symboler</li>
              <li><strong>Unikhed:</strong> Brug et unikt kodeord til hver tjeneste</li>
              <li><strong>Tilfældighed:</strong> Undgå ord fra ordbogen eller personlige oplysninger</li>
            </ul>
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
              Brug en password manager
            </h3>
            <p>
              Med unikke, komplekse kodeord til hver konto kan det være svært at huske dem alle. 
              En password manager som Bitwarden, 1Password eller LastPass kan hjælpe dig med at 
              gemme og organisere dine kodeord sikkert.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 Kodeordsgenerator.dk - Gratis dansk password generator</p>
          <p className="mt-1">
            Sikker, privat og uden login. Alt foregår i din browser.
          </p>
        </footer>
      </div>
    </main>
  );
}
