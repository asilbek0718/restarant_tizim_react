import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import useAuthStore from '@/store/auth/authStore';
import { TRANSLATIONS } from '@/shared/constants/translations';
import ThemeToggle from '@/shared/components/ThemeToggle';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const t = TRANSLATIONS.auth;
  const common = TRANSLATIONS.common;

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { authService } = await import('@/shared/services/authService');
      const { ROLES } = await import('@/shared/constants/roles');
      const { user } = await authService.login(email, password);

      // Professional role-based landing pages
      const redirectMap = {
        [ROLES.ADMIN]: '/',
        [ROLES.MANAGER]: '/',
        [ROLES.WAITER]: '/tables',
        [ROLES.KITCHEN]: '/kitchen',
        [ROLES.CASHIER]: '/cashier'
      };

      const targetPath = redirectMap[user.role] || '/';
      navigate(targetPath);

    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("RESPONSE:", err.response);
      console.log("REQUEST:", err.request);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Login Error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-light-bg dark:bg-surface-dark-bg transition-colors duration-500 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="glass-card p-10 sm:p-14 relative overflow-hidden">
          {/* Top Branding */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, delay: 0.2 }}
              className="w-20 h-20 premium-gradient rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-primary-500/40 mb-8"
            >
              <UtensilsCrossed className="text-white w-10 h-10" />
            </motion.div>
            <h1 className="text-4xl font-black tracking-tight dark:text-white text-slate-900 mb-3 uppercase">
              Luxe <span className="text-primary-500">Resto</span>
            </h1>
            <p className="dark:text-gray-500 text-slate-500 font-medium">{t.welcomeTitle}</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[4px] ml-1">
                {t.emailLabel}
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[4px]">
                  {t.passwordLabel}
                </label>
                <button type="button" className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline">
                  {t.forgotPassword}
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-5 text-lg shadow-2xl shadow-primary-500/30 group"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>{t.loginButton}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Decoration */}
          <div className="mt-14 pt-8 border-t dark:border-white/5 border-slate-100 text-center">
            <p className="text-[10px] dark:text-gray-700 text-slate-300 font-black uppercase tracking-[10px]">
              Zamonaviy Boshqaruv Tizimi
            </p>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-xs dark:text-slate-500 text-slate-400 font-medium"
        >
          &copy; 2026 Luxe Resto. Barcha huquqlar himoyalangan.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
