import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinInput = async (digit: string) => {
    if (loading) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError('');

    if (newPin.length === 6) {
      setLoading(true);
      const success = await login(newPin);
      if (!success) {
        setError('Hatalı PIN kodu. Tekrar deneyin.');
        setTimeout(() => { setPin(''); setError(''); setLoading(false); }, 1500);
      }
      // Başarılıysa App.tsx zaten sayfayı değiştirecek
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-sm animate-fade-in px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
            <span className="material-symbols-outlined text-primary text-4xl">inventory_2</span>
          </div>
          <h1 className="text-3xl font-bold text-white">StokTakip Pro</h1>
          <p className="text-slate-400 mt-2">PIN kodunuzu girin</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                i < pin.length
                  ? error
                    ? 'bg-red-500/30 border-red-500'
                    : 'bg-primary/30 border-primary'
                  : 'border-slate-600 bg-slate-800/50'
              }`}
            >
              {i < pin.length && (
                <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-400' : 'bg-primary'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-red-400 text-sm mb-4 animate-pulse">{error}</p>
        )}

        {/* PIN Pad */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="grid grid-cols-3 gap-3">
            {['1','2','3','4','5','6','7','8','9'].map(d => (
              <button
                key={d}
                onClick={() => handlePinInput(d)}
                disabled={pin.length >= 6 || loading}
                className="h-14 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xl font-semibold hover:bg-primary/20 hover:border-primary/50 active:scale-95 transition-all disabled:opacity-40"
              >
                {d}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="h-14 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 text-sm hover:bg-slate-700 active:scale-95 transition-all"
            >
              Temizle
            </button>
            <button
              onClick={() => handlePinInput('0')}
              disabled={pin.length >= 6 || loading}
              className="h-14 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xl font-semibold hover:bg-primary/20 hover:border-primary/50 active:scale-95 transition-all disabled:opacity-40"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-14 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-xl">backspace</span>
            </button>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          İlk giriş için PIN: <span className="text-slate-500 font-mono">000000</span>
        </p>
      </div>
    </div>
  );
}
