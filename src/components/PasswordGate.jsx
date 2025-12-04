// src/components/PasswordGate.jsx
import { useEffect, useState } from 'react';

export default function PasswordGate({
  children,
  correctPassword,
  storageKey = 'app-unlocked', // localStorage用のキー
}) {
  const [input, setInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');

  // 一度正解したら localStorage から復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'unlocked') {
        setUnlocked(true);
      }
    } catch {
      // localStorage が使えない環境は無視
    }
  }, [storageKey]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === correctPassword) {
      setUnlocked(true);
      setError('');
      try {
        localStorage.setItem(storageKey, 'unlocked');
      } catch {
        // 何もしない
      }
    } else {
      setError('パスワードが違います');
    }
  };

  if (unlocked) {
    return children;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-sm bg-white shadow-lg rounded-xl p-6 border border-slate-200">
        <h1 className="text-xl font-semibold text-slate-900 mb-3 text-center">
          パスワードを入力してください
        </h1>
        <p className="text-xs text-slate-500 mb-4 text-center">
          教員から案内されたパスワードを入力すると教材が開きます。
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="パスワード"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {error && (
            <p className="text-xs text-red-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-md bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium py-2 transition-colors"
          >
            入室する
          </button>
        </form>
        <p className="mt-4 text-[11px] text-slate-400 text-center">
          ※ このパスワードは簡易的な制限です。URLやパスワードを広く共有しないでください。
        </p>
      </div>
    </div>
  );
}