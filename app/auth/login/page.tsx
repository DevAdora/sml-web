"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, AlertCircle, BookOpen, Users, TrendingUp } from "lucide-react";

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

  const features = [
    {
      icon: <BookOpen size={12} strokeWidth={1.5} />,
      title: "Deep reading lists",
      sub: "Organize your shelf, track progress, annotate",
      active: true,
    },
    {
      icon: <Users size={12} strokeWidth={1.5} />,
      title: "Writer community",
      sub: "Follow voices that shape how you read",
      active: false,
    },
    {
      icon: <TrendingUp size={12} strokeWidth={1.5} />,
      title: "Trending in SML",
      sub: "Discover what readers are talking about",
      active: false,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        .auth-root {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: Inter, -apple-system, sans-serif;
        }

        .auth-card {
          display: flex;
          width: 100%;
          max-width: 900px;
          min-height: 560px;
          background: #0a0a0a;
          border: 1px solid #1f1f1f;
        }

        /* Left panel */
        .auth-left {
          width: 42%;
          background: #111;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.5rem;
          flex-shrink: 0;
          border-right: 1px solid #1f1f1f;
        }

        .left-dots {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .left-fade {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 180px;
          background: linear-gradient(to top, #111, transparent);
          pointer-events: none;
        }

        .left-top { position: relative; z-index: 1; }

        .left-eyebrow {
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          margin-bottom: 1.5rem;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          opacity: 0.35;
          transition: opacity 0.2s;
        }

        .feature-item.active { opacity: 1; }

        .feat-icon {
          width: 1.75rem;
          height: 1.75rem;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
          color: rgba(255,255,255,0.4);
        }

        .feature-item.active .feat-icon {
          background: #1e1e1e;
          border-color: #333;
          color: #fff;
        }

        .feat-title {
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          margin-bottom: 0.15rem;
        }

        .feature-item.active .feat-title { color: #fff; }

        .feat-sub {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.22);
          line-height: 1.45;
          font-weight: 400;
        }

        .feature-item.active .feat-sub { color: rgba(255,255,255,0.38); }

        .left-bottom { position: relative; z-index: 1; }

        .left-wordmark {
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.01em;
          margin-bottom: 0.2rem;
        }

        .left-tagline {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.25);
          font-weight: 400;
        }

        /* Right form */
        .auth-right {
          flex: 1;
          padding: 2.5rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .form-heading {
          font-size: 1.35rem;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.02em;
          margin-bottom: 0.3rem;
        }

        .form-subheading {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.35);
          margin-bottom: 1.75rem;
          font-weight: 400;
          line-height: 1.5;
        }

        .field-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          margin-bottom: 0.4rem;
          letter-spacing: 0.01em;
        }

        .field-input {
          width: 100%;
          padding: 0.675rem 0.9rem;
          background: #161616;
          border: 1px solid #272727;
          color: #fff;
          font-family: Inter, -apple-system, sans-serif;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
          -webkit-appearance: none;
          border-radius: 0;
          margin-bottom: 1rem;
        }

        .field-input::placeholder { color: rgba(255,255,255,0.16); }
        .field-input:focus { border-color: #444; }
        .field-input.with-icon { padding-right: 2.75rem; }

        .input-wrap { position: relative; margin-bottom: 1rem; }
        .input-wrap .field-input { margin-bottom: 0; }

        .toggle-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.22);
          display: flex;
          align-items: center;
          transition: color 0.15s;
          padding: 0.2rem;
        }

        .toggle-btn:hover { color: rgba(255,255,255,0.55); }

        .btn-primary {
          width: 100%;
          padding: 0.72rem;
          background: #fff;
          color: #0a0a0a;
          border: none;
          font-family: Inter, -apple-system, sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
          transition: opacity 0.15s;
        }

        .btn-primary:hover:not(:disabled) { opacity: 0.88; }
        .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

        .spinner {
          width: 0.875rem;
          height: 0.875rem;
          border: 1.5px solid rgba(10,10,10,0.25);
          border-top-color: #0a0a0a;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          margin: 1.25rem 0;
        }

        .div-line { flex: 1; height: 1px; background: #1f1f1f; }

        .div-text {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.22);
          font-weight: 400;
        }

        .btn-ghost {
          width: 100%;
          padding: 0.68rem;
          background: transparent;
          color: rgba(255,255,255,0.6);
          border: 1px solid #272727;
          font-family: Inter, -apple-system, sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
          text-align: center;
          display: block;
          text-decoration: none;
        }

        .btn-ghost:hover { border-color: #444; color: #fff; }

        .back-link {
          display: block;
          text-align: center;
          margin-top: 1.1rem;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.25);
          text-decoration: none;
          transition: color 0.15s;
        }

        .back-link:hover { color: rgba(255,255,255,0.6); }

        .error-banner {
          background: rgba(220, 60, 50, 0.08);
          border: 1px solid rgba(220, 60, 50, 0.18);
          border-left: 2px solid rgba(220, 80, 60, 0.7);
          padding: 0.75rem 0.875rem;
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          margin-bottom: 1rem;
        }

        .error-title {
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(240, 100, 80, 0.9);
          margin-bottom: 0.12rem;
        }

        .error-msg {
          font-size: 0.8rem;
          color: rgba(240, 130, 110, 0.85);
          line-height: 1.4;
        }

        @media (max-width: 640px) {
          .auth-left { display: none; }
          .auth-right { padding: 2.5rem 1.75rem; }
        }
      `}</style>

      <div className="auth-root">
        <div className="auth-card">
          {/* Left panel */}
          <div className="auth-left">
            <div className="left-dots" />
            <div className="left-fade" />
            <div className="left-top">
              <p className="left-eyebrow">Why SML</p>
              {features.map((f, i) => (
                <div key={i} className={`feature-item${f.active ? " active" : ""}`}>
                  <div className="feat-icon">{f.icon}</div>
                  <div>
                    <p className="feat-title">{f.title}</p>
                    <p className="feat-sub">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="left-bottom">
              <p className="left-wordmark">Scriptum Mens Lumen</p>
              <p className="left-tagline">The light of the written mind</p>
            </div>
          </div>

          {/* Right form */}
          <div className="auth-right">
            <h1 className="form-heading">Sign in</h1>
            <p className="form-subheading">Welcome back. Continue your reading journey.</p>

            <form onSubmit={handleLogin}>
              {error && (
                <div className="error-banner">
                  <AlertCircle size={14} color="rgba(240,100,80,0.9)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p className="error-title">Sign in failed</p>
                    <p className="error-msg">{error}</p>
                  </div>
                </div>
              )}

              <label className="field-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="field-input"
                placeholder="you@example.com"
              />

              <label className="field-label">Password</label>
              <div className="input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="field-input with-icon"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-btn"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <><div className="spinner" /> Signing in…</>
                ) : (
                  <><LogIn size={14} /> Sign In</>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <div className="div-line" />
              <span className="div-text">or</span>
              <div className="div-line" />
            </div>

            <Link href="/auth/signup" className="btn-ghost">
              Create an account
            </Link>

            <Link href="/" className="back-link">← Back to home</Link>
          </div>
        </div>
      </div>
    </>
  );
}