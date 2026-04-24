"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.error ?? "Login failed");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap');

        .login-root {
          min-height: 100vh;
          background: #0a0806;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: 'Crimson Pro', Georgia, serif;
          position: relative;
          overflow: hidden;
        }

        .login-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 15% 15%, rgba(180, 120, 30, 0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 70% at 85% 85%, rgba(100, 60, 10, 0.06) 0%, transparent 60%);
          pointer-events: none;
        }

        .login-split {
          display: flex;
          width: 100%;
          max-width: 900px;
          min-height: 560px;
          background: #100e09;
          border: 1px solid rgba(255, 200, 80, 0.08);
          box-shadow: 0 8px 80px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.4);
          position: relative;
          z-index: 1;
        }

        .login-panel-left {
          width: 42%;
          background: #080604;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 2.5rem;
          flex-shrink: 0;
          border-right: 1px solid rgba(255, 200, 80, 0.06);
        }

        .panel-glow {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 120% 55% at 50% 0%, rgba(180, 120, 30, 0.14) 0%, transparent 60%),
            radial-gradient(ellipse 70% 100% at 80% 100%, rgba(80, 50, 10, 0.2) 0%, transparent 55%);
        }

        .panel-lines {
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(
            0deg,
            transparent, transparent 28px,
            rgba(255, 200, 80, 0.025) 28px,
            rgba(255, 200, 80, 0.025) 29px
          );
        }

        .panel-bigquote {
          position: absolute;
          top: 1.5rem; left: 2rem;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 9rem;
          line-height: 0.8;
          color: rgba(200, 150, 50, 0.07);
          font-weight: 300;
          user-select: none;
          pointer-events: none;
        }

        .panel-content { position: relative; z-index: 1; }

        .panel-rule {
          width: 2rem; height: 1px;
          background: rgba(200, 150, 50, 0.28);
          margin-bottom: 0.875rem;
        }

        .panel-quote {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.1rem;
          font-style: italic;
          font-weight: 300;
          color: rgba(230, 200, 140, 0.82);
          line-height: 1.75;
          margin-bottom: 0.75rem;
        }

        .panel-attr {
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(200, 150, 50, 0.5);
        }

        .login-panel-right {
          flex: 1;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .login-wordmark {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 2.1rem;
          font-weight: 400;
          letter-spacing: 0.08em;
          color: #e8d5a0;
          margin-bottom: 0.2rem;
        }

        .login-tagline {
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 0.82rem;
          font-style: italic;
          color: rgba(200, 150, 60, 0.6);
          margin-bottom: 2.25rem;
        }

        .login-form-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.4rem;
          font-weight: 500;
          color: #dfc47e;
          margin-bottom: 1.5rem;
        }

        .form-group { margin-bottom: 1.1rem; }

        .form-label {
          display: block;
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(200, 160, 70, 0.6);
          margin-bottom: 0.4rem;
        }

        .form-input {
          width: 100%;
          padding: 0.7rem 0.9rem;
          background: #0d0b08;
          border: 1px solid rgba(200, 150, 60, 0.14);
          border-bottom: 2px solid rgba(200, 150, 60, 0.3);
          color: #ddc98a;
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
          -webkit-appearance: none;
        }

        .form-input::placeholder { color: rgba(200, 150, 60, 0.22); }

        .form-input:focus {
          border-bottom-color: #d4a84b;
          background: #0f0d09;
        }

        .input-wrapper { position: relative; }

        .input-icon-btn {
          position: absolute;
          right: 0.75rem; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(200, 150, 60, 0.35);
          display: flex; align-items: center;
          transition: color 0.2s;
          padding: 0.25rem;
        }

        .input-icon-btn:hover { color: rgba(200, 150, 60, 0.75); }
        .form-input.with-icon { padding-right: 2.75rem; }

        .btn-primary {
          width: 100%;
          padding: 0.85rem 1.5rem;
          background: #c9960a;
          color: #0a0806;
          border: none;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .btn-primary:hover:not(:disabled) { background: #dba80e; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-spinner {
          width: 1rem; height: 1rem;
          border: 1.5px solid rgba(10, 8, 6, 0.3);
          border-top-color: #0a0806;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .login-divider {
          display: flex; align-items: center;
          gap: 1rem; margin: 1.4rem 0;
        }

        .divider-line { flex: 1; height: 1px; background: rgba(200, 150, 60, 0.1); }

        .divider-text {
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 0.75rem;
          font-style: italic;
          color: rgba(200, 150, 60, 0.38);
          white-space: nowrap;
        }

        .btn-secondary {
          width: 100%;
          padding: 0.72rem 1.5rem;
          background: transparent;
          color: #c8a85a;
          border: 1px solid rgba(200, 150, 60, 0.22);
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          text-align: center;
          display: block;
          text-decoration: none;
        }

        .btn-secondary:hover {
          background: rgba(200, 150, 60, 0.06);
          border-color: rgba(200, 150, 60, 0.4);
        }

        .back-link {
          display: block;
          text-align: center;
          margin-top: 1.25rem;
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 0.82rem;
          font-style: italic;
          color: rgba(200, 150, 60, 0.38);
          text-decoration: none;
          transition: color 0.2s;
        }

        .back-link:hover { color: rgba(200, 150, 60, 0.7); }

        .error-box {
          background: rgba(180, 60, 40, 0.1);
          border: 1px solid rgba(180, 60, 40, 0.2);
          border-left: 2px solid rgba(200, 80, 50, 0.7);
          padding: 0.8rem 1rem;
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          margin-bottom: 1.1rem;
        }

        .error-title {
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(220, 100, 80, 0.9);
          margin-bottom: 0.15rem;
        }

        .error-msg {
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 0.875rem;
          font-style: italic;
          color: rgba(220, 130, 110, 0.85);
        }

        @media (max-width: 640px) {
          .login-panel-left { display: none; }
          .login-panel-right { padding: 2.5rem 1.75rem; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-split">
          <div className="login-panel-left">
            <div className="panel-glow" />
            <div className="panel-lines" />
            <div className="panel-bigquote">"</div>
            <div className="panel-content">
              <div className="panel-rule" />
              <p className="panel-quote">
                A reader lives a thousand lives before he dies. The man who never reads lives only one.
              </p>
              <span className="panel-attr">— George R.R. Martin</span>
            </div>
          </div>

          <div className="login-panel-right">
            <div className="login-wordmark">SML</div>
            <p className="login-tagline">where every page finds its reader</p>
            <h2 className="login-form-title">Welcome back</h2>

            <form onSubmit={handleLogin}>
              {error && (
                <div className="error-box">
                  <AlertCircle size={15} color="rgba(220,100,80,0.9)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p className="error-title">Authentication Failed</p>
                    <p className="error-msg">{error}</p>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input with-icon"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="input-icon-btn"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <><div className="btn-spinner" /> Signing in…</>
                ) : (
                  <><LogIn size={14} /> Sign In</>
                )}
              </button>
            </form>

            <div className="login-divider">
              <div className="divider-line" />
              <span className="divider-text">new to the shelves?</span>
              <div className="divider-line" />
            </div>

            <Link href="/auth/signup" className="btn-secondary">
              Create an Account
            </Link>

            <Link href="/" className="back-link">← Back to Home</Link>
          </div>
        </div>
      </div>
    </>
  );
}