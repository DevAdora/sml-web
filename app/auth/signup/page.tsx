"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/client";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    if (!fullName.trim()) {
      setError("Full name is required");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signupError) throw signupError;
      if (!data.user) throw new Error("Failed to create user account");
      if (data.user && !data.session) {
        setSuccess(true);
        setError("");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An error occurred during signup.";
      setError(message);
      setLoading(false);
    }
  };

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap');

    .su-root {
      min-height: 100vh;
      background: #0a0806;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.5rem;
      font-family: 'Crimson Pro', Georgia, serif;
      position: relative;
      overflow: hidden;
    }

    .su-root::before {
      content: '';
      position: fixed; inset: 0;
      background:
        radial-gradient(ellipse 70% 50% at 85% 10%, rgba(180, 120, 30, 0.07) 0%, transparent 60%),
        radial-gradient(ellipse 50% 70% at 15% 90%, rgba(100, 60, 10, 0.06) 0%, transparent 60%);
      pointer-events: none;
    }

    .su-card {
      display: flex;
      width: 100%;
      max-width: 980px;
      background: #100e09;
      border: 1px solid rgba(255, 200, 80, 0.08);
      box-shadow: 0 8px 80px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4);
      min-height: 600px;
      position: relative;
      z-index: 1;
    }

    .su-left {
      width: 36%;
      background: #080604;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 2.25rem;
      flex-shrink: 0;
      border-right: 1px solid rgba(255, 200, 80, 0.06);
    }

    .su-glow {
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 100% 55% at 60% 0%, rgba(180, 120, 30, 0.13) 0%, transparent 55%),
        radial-gradient(ellipse 70% 100% at 20% 100%, rgba(80, 50, 10, 0.2) 0%, transparent 55%);
    }

    .su-lines {
      position: absolute; inset: 0;
      background-image: repeating-linear-gradient(
        0deg, transparent, transparent 28px,
        rgba(255, 200, 80, 0.025) 28px, rgba(255, 200, 80, 0.025) 29px
      );
    }

    .su-top { position: relative; z-index: 1; }

    .step-lbl {
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 0.65rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(200, 150, 60, 0.4);
      margin-bottom: 1.25rem;
    }

    .step-item {
      display: flex; align-items: flex-start;
      gap: 0.65rem; margin-bottom: 1.1rem;
      opacity: 0.35;
    }

    .step-item.active { opacity: 1; }

    .step-dot {
      width: 1.35rem; height: 1.35rem;
      border: 1px solid rgba(200, 150, 60, 0.35);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 0.62rem;
      color: rgba(200, 150, 60, 0.6);
    }

    .step-item.active .step-dot {
      background: rgba(200, 150, 60, 0.1);
      border-color: rgba(200, 150, 60, 0.65);
    }

    .step-text {
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 0.8rem; font-weight: 300;
      color: rgba(220, 195, 140, 0.6);
      line-height: 1.45;
    }

    .step-item.active .step-text { color: rgba(230, 205, 155, 0.92); }

    .su-bot { position: relative; z-index: 1; }

    .su-rule { width: 2rem; height: 1px; background: rgba(200, 150, 50, 0.28); margin-bottom: 0.875rem; }

    .su-quote {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1rem; font-style: italic; font-weight: 300;
      color: rgba(230, 200, 140, 0.75);
      line-height: 1.7; margin-bottom: 0.7rem;
    }

    .su-attr {
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 0.68rem; letter-spacing: 0.13em;
      text-transform: uppercase; color: rgba(200, 150, 50, 0.5);
    }

    .su-right {
      flex: 1;
      padding: 2.75rem 3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .su-wordmark {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.9rem; font-weight: 400;
      letter-spacing: 0.08em; color: #e8d5a0;
      margin-bottom: 0.2rem;
    }

    .su-tagline {
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 0.82rem; font-style: italic;
      color: rgba(200, 150, 60, 0.6);
      margin-bottom: 1.9rem;
    }

    .su-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.35rem; font-weight: 500;
      color: #dfc47e; margin-bottom: 1.35rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: minmax(0,1fr) minmax(0,1fr);
      gap: 0 1rem;
    }

    .form-group { margin-bottom: 1rem; }
    .form-group.full { grid-column: 1 / -1; }

    .form-label {
      display: block;
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 0.68rem; letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(200, 160, 70, 0.6);
      margin-bottom: 0.38rem;
    }

    .form-input {
      width: 100%;
      padding: 0.65rem 0.875rem;
      background: #0d0b08;
      border: 1px solid rgba(200, 150, 60, 0.14);
      border-bottom: 2px solid rgba(200, 150, 60, 0.28);
      color: #ddc98a;
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
      box-sizing: border-box;
      -webkit-appearance: none;
    }

    .form-input::placeholder { color: rgba(200, 150, 60, 0.2); }
    .form-input:focus { border-bottom-color: #d4a84b; background: #0f0d09; }

    .input-wrapper { position: relative; }

    .input-icon-btn {
      position: absolute; right: 0.7rem; top: 50%;
      transform: translateY(-50%);
      background: none; border: none; cursor: pointer;
      color: rgba(200, 150, 60, 0.32);
      display: flex; align-items: center;
      transition: color 0.2s; padding: 0.2rem;
    }

    .input-icon-btn:hover { color: rgba(200, 150, 60, 0.7); }
    .form-input.with-icon { padding-right: 2.5rem; }

    .form-hint {
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 0.72rem; font-style: italic;
      color: rgba(200, 150, 60, 0.35);
      margin-top: 0.25rem;
    }

    .btn-primary {
      width: 100%;
      padding: 0.82rem 1.5rem;
      background: #c9960a;
      color: #0a0806;
      border: none;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 0.92rem; font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.2s;
      display: flex; align-items: center;
      justify-content: center; gap: 0.5rem;
      margin-top: 0.5rem;
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

    .su-divider {
      display: flex; align-items: center;
      gap: 0.875rem; margin: 1.2rem 0;
    }

    .div-line { flex: 1; height: 1px; background: rgba(200, 150, 60, 0.1); }

    .div-text {
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 0.72rem; font-style: italic;
      color: rgba(200, 150, 60, 0.36); white-space: nowrap;
    }

    .btn-secondary {
      width: 100%;
      padding: 0.68rem;
      background: transparent;
      color: #c8a85a;
      border: 1px solid rgba(200, 150, 60, 0.22);
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 0.88rem; font-weight: 500;
      letter-spacing: 0.08em; text-transform: uppercase;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
      text-align: center; display: block; text-decoration: none;
    }

    .btn-secondary:hover {
      background: rgba(200, 150, 60, 0.06);
      border-color: rgba(200, 150, 60, 0.4);
    }

    .back-link {
      display: block; text-align: center;
      margin-top: 1.1rem;
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 0.78rem; font-style: italic;
      color: rgba(200, 150, 60, 0.36);
      text-decoration: none; transition: color 0.2s;
    }

    .back-link:hover { color: rgba(200, 150, 60, 0.7); }

    .error-box {
      background: rgba(180, 60, 40, 0.1);
      border: 1px solid rgba(180, 60, 40, 0.2);
      border-left: 2px solid rgba(200, 80, 50, 0.7);
      padding: 0.75rem 0.875rem;
      display: flex; align-items: flex-start;
      gap: 0.55rem; margin-bottom: 1rem;
    }

    .error-title {
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 0.7rem; letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(220, 100, 80, 0.9);
      margin-bottom: 0.12rem;
    }

    .error-msg {
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 0.85rem; font-style: italic;
      color: rgba(220, 130, 110, 0.85);
    }

    /* Success */
    .success-root {
      min-height: 100vh;
      background: #0a0806;
      display: flex; align-items: center;
      justify-content: center; padding: 2rem;
      font-family: 'Crimson Pro', Georgia, serif;
    }

    .success-card {
      max-width: 440px; width: 100%;
      background: #100e09;
      border: 1px solid rgba(255, 200, 80, 0.08);
      box-shadow: 0 8px 80px rgba(0,0,0,0.6);
      padding: 3.5rem 3rem; text-align: center;
    }

    .success-icon {
      width: 3.5rem; height: 3.5rem;
      background: rgba(100, 160, 80, 0.08);
      border: 1px solid rgba(100, 160, 80, 0.2);
      border-radius: 50%;
      display: flex; align-items: center;
      justify-content: center; margin: 0 auto 1.5rem;
    }

    .success-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.9rem; font-weight: 400;
      color: #e8d5a0; margin-bottom: 0.625rem;
    }

    .success-rule {
      width: 2.5rem; height: 1px;
      background: rgba(200, 150, 50, 0.28);
      margin: 0 auto 1.25rem;
    }

    .success-sub {
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 1rem; font-style: italic;
      color: rgba(200, 160, 70, 0.65);
      line-height: 1.6; margin-bottom: 2rem;
    }

    .success-cta {
      display: inline-block;
      padding: 0.75rem 2rem;
      background: #c9960a; color: #0a0806;
      text-decoration: none;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 0.9rem; font-weight: 600;
      letter-spacing: 0.14em; text-transform: uppercase;
      transition: background 0.2s;
    }

    .success-cta:hover { background: #dba80e; }

    @media (max-width: 680px) {
      .su-left { display: none; }
      .su-right { padding: 2.5rem 1.75rem; }
      .form-grid { grid-template-columns: 1fr; }
      .form-group.full { grid-column: 1; }
    }
  `;

  if (success) {
    return (
      <>
        <style>{sharedStyles}</style>
        <div className="success-root">
          <div className="success-card">
            <div className="success-icon">
              <CheckCircle2 size={22} color="rgba(120,200,100,0.8)" />
            </div>
            <h2 className="success-title">Your shelf awaits.</h2>
            <div className="success-rule" />
            <p className="success-sub">
              {error
                ? "Please check your inbox to verify your email before signing in."
                : "Your account has been created. Redirecting to your dashboard…"}
            </p>
            {error && (
              <Link href="/auth/login" className="success-cta">
                Continue to Login
              </Link>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{sharedStyles}</style>
      <div className="su-root">
        <div className="su-card">
          <div className="su-left">
            <div className="su-glow" />
            <div className="su-lines" />

            <div className="su-top">
              <p className="step-lbl">Join the community</p>
              <div className="step-item active">
                <div className="step-dot">I</div>
                <p className="step-text">Create your account with name and email</p>
              </div>
              <div className="step-item">
                <div className="step-dot">II</div>
                <p className="step-text">Build your personal reading shelf</p>
              </div>
              <div className="step-item">
                <div className="step-dot">III</div>
                <p className="step-text">Share reviews, discover voices, connect</p>
              </div>
            </div>

            <div className="su-bot">
              <div className="su-rule" />
              <p className="su-quote">There is no friend as loyal as a book.</p>
              <span className="su-attr">— Ernest Hemingway</span>
            </div>
          </div>

          <div className="su-right">
            <div className="su-wordmark">SML</div>
            <p className="su-tagline">where every page finds its reader</p>
            <h2 className="su-title">Open your account</h2>

            <form onSubmit={handleSignup}>
              {error && (
                <div className="error-box">
                  <AlertCircle size={14} color="rgba(220,100,80,0.9)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p className="error-title">Signup Failed</p>
                    <p className="error-msg">{error}</p>
                  </div>
                </div>
              )}

              <div className="form-grid">
                <div className="form-group full">
                  <label htmlFor="fullName" className="form-label">Full Name</label>
                  <input
                    id="fullName" type="text" value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required className="form-input" placeholder="John Doe"
                  />
                </div>

                <div className="form-group full">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    id="email" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required className="form-input" placeholder="you@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-wrapper">
                    <input
                      id="password" type={showPassword ? "text" : "password"}
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      required minLength={6}
                      className="form-input with-icon" placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="input-icon-btn">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <p className="form-hint">At least 6 characters</p>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <input
                      id="confirmPassword" type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      required className="form-input with-icon" placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="input-icon-btn">
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <><div className="btn-spinner" /> Creating Account…</>
                ) : (
                  "Open My Account"
                )}
              </button>
            </form>

            <div className="su-divider">
              <div className="div-line" />
              <span className="div-text">already a reader?</span>
              <div className="div-line" />
            </div>

            <Link href="/auth/login" className="btn-secondary">Sign In</Link>
            <Link href="/" className="back-link">← Back to Home</Link>
          </div>
        </div>
      </div>
    </>
  );
}