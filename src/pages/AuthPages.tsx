import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store';
import { clsx } from 'clsx';
import { SprioLogo } from '@/components/ui/SprioLogo';

// ── Shared ─────────────────────────────────────────────────────────────────────
const GoogleSVG = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

function AuthLayout({ children, maxW = 'max-w-sm' }: { children: React.ReactNode; maxW?: string }) {
    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #1e1040 0%, #0a0a0a 70%)' }}
        >
            <div className={`w-full ${maxW}`}>
                {/* Logo */}
                <div className="flex items-center justify-center mb-8">
                    <SprioLogo height={32} />
                </div>
                <div className="card p-7 shadow-2xl border-white/5">{children}</div>
            </div>
        </div>
    );
}

function ErrorBanner({ message }: { message: string }) {
    return (
        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-error/10 border border-error/30">
            <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
            <p className="text-xs text-error leading-relaxed">{message}</p>
        </div>
    );
}

function SuccessBanner({ message }: { message: string }) {
    return (
        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-success/10 border border-success/30">
            <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <p className="text-xs text-success leading-relaxed">{message}</p>
        </div>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-[11px] text-error mt-1">{message}</p>;
}

function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: '8+ characters', pass: password.length >= 8 },
        { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
        { label: 'Number', pass: /[0-9]/.test(password) },
    ];
    const strength = checks.filter(c => c.pass).length;
    const colors = ['', 'bg-error', 'bg-warning', 'bg-success'];
    const labels = ['', 'Weak', 'Fair', 'Strong'];

    if (!password) return null;

    return (
        <div className="mt-2 space-y-1.5">
            <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                    <div key={i} className={clsx('h-1 flex-1 rounded-full transition-colors', strength >= i ? colors[strength] : 'bg-border')} />
                ))}
            </div>
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted">{labels[strength]}</span>
                <div className="flex gap-2">
                    {checks.map(c => (
                        <span key={c.label} className={clsx('text-[10px]', c.pass ? 'text-success' : 'text-text-muted')}>
                            {c.pass ? '✓' : '○'} {c.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Login Page ─────────────────────────────────────────────────────────────────
export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loading, error, clearError, isAuthenticated, user } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

    const from = (location.state as any)?.from?.pathname || '/dashboard';

    useEffect(() => {
        if (isAuthenticated && user) {
            const dest = user.isAdmin ? '/admin' : from;
            navigate(dest, { replace: true });
        }
    }, [isAuthenticated, user]);

    useEffect(() => { return () => clearError(); }, []);

    const validate = () => {
        const errs: typeof fieldErrors = {};
        if (!email.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
        if (!password) errs.password = 'Password is required';
        else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        await login(email, password);
    };

    const handleDemoLogin = () => {
        setEmail('demo@sprio.io');
        setPassword('demo1234');
        setFieldErrors({});
    };

    return (
        <AuthLayout>
            <h1 className="text-lg font-bold text-text-primary mb-1">Sign in to Sprio Voice</h1>
            <p className="text-sm text-text-muted mb-5">Build voice agents that sound human.</p>

            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                {/* Google OAuth */}
                <button type="button" className="w-full flex items-center justify-center gap-2.5 btn-secondary py-2.5">
                    <GoogleSVG /> Continue with Google
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-xs text-text-muted">or</span>
                    <div className="flex-1 border-t border-border" />
                </div>

                {/* API Error */}
                {error && <ErrorBanner message={error} />}

                {/* Email */}
                <div>
                    <label className="form-label">Email</label>
                    <input
                        className={clsx('input w-full', fieldErrors.email && 'border-error/60 focus:border-error')}
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setFieldErrors(f => ({ ...f, email: undefined })); }}
                        autoComplete="email"
                        autoFocus
                    />
                    <FieldError message={fieldErrors.email} />
                </div>

                {/* Password */}
                <div>
                    <label className="form-label flex justify-between">
                        <span>Password</span>
                        <Link to="/forgot-password" className="text-accent hover:underline text-xs font-normal">Forgot?</Link>
                    </label>
                    <div className="relative">
                        <input
                            className={clsx('input w-full pr-10', fieldErrors.password && 'border-error/60 focus:border-error')}
                            type={showPass ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: undefined })); }}
                            autoComplete="current-password"
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <FieldError message={fieldErrors.password} />
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                    className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-70">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
                </button>

                {/* Demo credentials hint */}
                <button type="button" onClick={handleDemoLogin}
                    className="w-full text-center text-[11px] text-text-muted hover:text-accent transition-colors py-1">
                    ← Fill demo credentials
                </button>

                <p className="text-center text-xs text-text-muted">
                    Don't have an account? <Link to="/signup" className="text-accent hover:underline font-medium">Create one</Link>
                </p>
            </form>
        </AuthLayout>
    );
}

// ── Signup Page ────────────────────────────────────────────────────────────────
interface SignupForm {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    password: string;
}

type SignupErrors = Partial<Record<keyof SignupForm, string>>;

export function SignupPage() {
    const navigate = useNavigate();
    const { signup, loading, error, clearError, isAuthenticated } = useAuthStore();
    const [form, setForm] = useState<SignupForm>({ firstName: '', lastName: '', email: '', company: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [errors, setErrors] = useState<SignupErrors>({});

    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard', { replace: true });
    }, [isAuthenticated]);

    useEffect(() => { return () => clearError(); }, []);

    const set = (field: keyof SignupForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(f => ({ ...f, [field]: e.target.value }));
        setErrors(er => ({ ...er, [field]: undefined }));
    };

    const validate = (): boolean => {
        const errs: SignupErrors = {};
        if (!form.firstName.trim()) errs.firstName = 'First name is required';
        if (!form.lastName.trim()) errs.lastName = 'Last name is required';
        if (!form.email.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
        if (!form.company.trim()) errs.company = 'Company name is required';
        if (!form.password) errs.password = 'Password is required';
        else if (form.password.length < 8) errs.password = 'Must be at least 8 characters';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !agreed) return;
        await signup(form);
    };

    return (
        <AuthLayout maxW="max-w-md">
            <h1 className="text-lg font-bold text-text-primary mb-1">Get started for free</h1>
            <p className="text-sm text-text-muted mb-5">Start building voice AI agents in minutes.</p>

            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                <button type="button" className="w-full flex items-center justify-center gap-2.5 btn-secondary py-2.5">
                    <GoogleSVG /> Sign up with Google
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-xs text-text-muted">or</span>
                    <div className="flex-1 border-t border-border" />
                </div>

                {error && <ErrorBanner message={error} />}

                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="form-label">First Name</label>
                        <input className={clsx('input w-full', errors.firstName && 'border-error/60')}
                            placeholder="John" value={form.firstName} onChange={set('firstName')} autoFocus />
                        <FieldError message={errors.firstName} />
                    </div>
                    <div>
                        <label className="form-label">Last Name</label>
                        <input className={clsx('input w-full', errors.lastName && 'border-error/60')}
                            placeholder="Doe" value={form.lastName} onChange={set('lastName')} />
                        <FieldError message={errors.lastName} />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="form-label">Work Email</label>
                    <input className={clsx('input w-full', errors.email && 'border-error/60')}
                        type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} autoComplete="email" />
                    <FieldError message={errors.email} />
                </div>

                {/* Company */}
                <div>
                    <label className="form-label">Company Name</label>
                    <input className={clsx('input w-full', errors.company && 'border-error/60')}
                        placeholder="Acme Corp" value={form.company} onChange={set('company')} />
                    <FieldError message={errors.company} />
                </div>

                {/* Password */}
                <div>
                    <label className="form-label">Password</label>
                    <div className="relative">
                        <input className={clsx('input w-full pr-10', errors.password && 'border-error/60')}
                            type={showPass ? 'text' : 'password'}
                            placeholder="Create a strong password"
                            value={form.password} onChange={set('password')} autoComplete="new-password" />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <FieldError message={errors.password} />
                    <PasswordStrength password={form.password} />
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2.5 cursor-pointer group">
                    <div className="relative mt-0.5">
                        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="sr-only" />
                        <div className={clsx('w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                            agreed ? 'bg-accent border-accent' : 'border-border group-hover:border-accent/50')}>
                            {agreed && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                    </div>
                    <span className="text-xs text-text-muted leading-relaxed">
                        I agree to the <a href="#" className="text-accent hover:underline">Terms of Service</a> and <a href="#" className="text-accent hover:underline">Privacy Policy</a>
                    </span>
                </label>

                <button type="submit" disabled={loading || !agreed}
                    className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : 'Create Free Account'}
                </button>

                <p className="text-center text-xs text-text-muted">
                    Already have an account? <Link to="/login" className="text-accent hover:underline font-medium">Sign in</Link>
                </p>
            </form>
        </AuthLayout>
    );
}

// ── Forgot Password Page ───────────────────────────────────────────────────────
export function ForgotPasswordPage() {
    const { sendPasswordReset, loading, clearError } = useAuthStore();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [sent, setSent] = useState(false);

    useEffect(() => { return () => clearError(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) { setEmailError('Email is required'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Enter a valid email address'); return; }
        setEmailError('');
        await sendPasswordReset(email);
        setSent(true);
    };

    return (
        <AuthLayout>
            <h1 className="text-lg font-bold text-text-primary mb-1">Reset your password</h1>
            <p className="text-sm text-text-muted mb-5">Enter your email and we'll send you a reset link.</p>

            {sent ? (
                <div className="space-y-4">
                    <SuccessBanner message={`Reset link sent to ${email}. Check your inbox (and spam folder).`} />
                    <button onClick={() => { setSent(false); setEmail(''); }} className="w-full btn-secondary">
                        Send to a different email
                    </button>
                    <p className="text-center text-xs">
                        <Link to="/login" className="text-accent hover:underline">Back to sign in</Link>
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                    <div>
                        <label className="form-label">Email address</label>
                        <input className={clsx('input w-full', emailError && 'border-error/60')}
                            type="email" placeholder="you@company.com"
                            value={email} onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                            autoFocus autoComplete="email" />
                        <FieldError message={emailError} />
                    </div>
                    <button type="submit" disabled={loading}
                        className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-70">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Send Reset Link'}
                    </button>
                    <p className="text-center text-xs">
                        <Link to="/login" className="text-accent hover:underline">← Back to sign in</Link>
                    </p>
                </form>
            )}
        </AuthLayout>
    );
}
