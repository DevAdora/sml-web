"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/client";
import { Eye, EyeOff, AlertCircle, Clock, BookOpen, Users, CheckCircle2 } from "lucide-react";

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
  const [emailVerify, setEmailVerify] = useState(false);

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
        setEmailVerify(true);
        setSuccess(true);
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

  const steps = [
    { icon: <Clock size={12} strokeWidth={1.5} />, title: "Create your account", sub: "Name, email, and you're in", active: true },
    { icon: <BookOpen size={12} strokeWidth={1.5} />, title: "Build your shelf", sub: "Track and organize everything you read", active: false },
    { icon: <Users size={12} strokeWidth={1.5} />, title: "Join the community", sub: "Share perspectives, discover new voices", active: false },
  ];

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

    .su-root {
      min-height: 100vh;
      background: #0a0a0a;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.5rem;
      font-family: Inter, -apple-system, sans-serif;
    }

    .su-card {
      display: flex;
      width: 100%;
      max-width: 980px;
      min-height: 580px;
      background: #0a0a0a;
      border: 1px solid #1f1f1f;
    }

    .su-left {
      width: 36%;
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

    .su-dots {
      position: absolute; inset: 0;
      background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
      background-size: 24px 24px;
      pointer-events: none;
    }

    .su-fade {
      position: absolute; bottom: 0; left: 0; right: 0;
      height: 180px;
      background: linear-gradient(to top, #111, transparent);
      pointer-events: none;
    }

    .su-top { position: relative; z-index: 1; }

    .su-eyebrow {
      font-size: 0.65rem; font-weight: 500;
      letter-spacing: 0.12em; text-transform: uppercase;
      color: rgba(255,255,255,0.28); margin-bottom: 1.5rem;
    }

    .step-item {
      display: flex; align-items: flex-start;
      gap: 0.75rem; margin-bottom: 1.25rem;
      opacity: 0.35;
    }

    .step-item.active { opacity: 1; }

    .step-icon {
      width: 1.75rem; height: 1.75rem;
      background: #1a1a1a; border: 1px solid #2a2a2a;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 1px;
      color: rgba(255,255,255,0.4);
    }

    .step-item.active .step-icon {
      background: #1e1e1e; border-color: #333; color: #fff;
    }

    .step-title {
      font-size: 0.8rem; font-weight: 500;
      color: rgba(255,255,255,0.45); margin-bottom: 0.15rem;
    }

    .step-item.active .step-title { color: #fff; }

    .step-sub {
      font-size: 0.72rem; color: rgba(255,255,255,0.22);
      line-height: 1.45; font-weight: 400;
    }

    .step-item.active .step-sub { color: rgba(255,255,255,0.38); }

    .su-bottom { position: relative; z-index: 1; }

    .su-wordmark {
      font-size: 1rem; font-weight: 600; color: #fff;
      letter-spacing: -0.01em; margin-bottom: 0.2rem;
    }

    .su-tagline { font-size: 0.72rem; color: rgba(255,255,255,0.25); font-weight: 400; }

    .su-right {
      flex: 1; padding: 2.5rem 3rem;
      display: flex; flex-direction: column; justify-content: center;
    }

    .form-heading {
      font-size: 1.35rem; font-weight: 600; color: #fff;
      letter-spacing: -0.02em; margin-bottom: 0.3rem;
    }

    .form-subheading {
      font-size: 0.8rem; color: rgba(255,255,255,0.35);
      margin-bottom: 1.75rem; font-weight: 400; line-height: 1.5;
    }

    .form-grid {
      display: grid;
      grid-template-columns: minmax(0,1fr) minmax(0,1fr);
      gap: 0 0.75rem;
    }

    .form-group { margin-bottom: 0; }
    .form-group.full { grid-column: 1 / -1; }

    .field-label {
      display: block; font-size: 0.7rem; font-weight: 500;
      color: rgba(255,255,255,0.45); margin-bottom: 0.4rem;
      letter-spacing: 0.01em;
    }

    .field-input {
      width: 100%; padding: 0.675rem 0.9rem;
      background: #161616; border: 1px solid #272727;
      color: #fff; font-family: Inter, -apple-system, sans-serif;
      font-size: 0.875rem; outline: none;
      transition: border-color 0.15s; -webkit-appearance: none;
      border-radius: 0; margin-bottom: 1rem;
    }

    .field-input::placeholder { color: rgba(255,255,255,0.16); }
    .field-input:focus { border-color: #444; }
    .field-input.with-icon { padding-right: 2.75rem; }

    .input-wrap { position: relative; margin-bottom: 1rem; }
    .input-wrap .field-input { margin-bottom: 0; }

    .toggle-btn {
      position: absolute; right: 0.75rem; top: 50%;
      transform: translateY(-50%); background: none; border: none;
      cursor: pointer; color: rgba(255,255,255,0.22);
      display: flex; align-items: center; transition: color 0.15s; padding: 0.2rem;
    }

    .toggle-btn:hover { color: rgba(255,255,255,0.55); }

    .field-hint {
      font-size: 0.7rem; color: rgba(255,255,255,0.22);
      margin-top: -0.75rem; margin-bottom: 1rem; font-weight: 400;
    }

    .btn-primary {
      width: 100%; padding: 0.72rem; background: #fff;
      color: #0a0a0a; border: none;
      font-family: Inter, -apple-system, sans-serif;
      font-size: 0.82rem; font-weight: 600; letter-spacing: 0.01em;
      cursor: pointer; display: flex; align-items: center;
      justify-content: center; gap: 0.5rem;
      margin-top: 0.25rem; transition: opacity 0.15s;
    }

    .btn-primary:hover:not(:disabled) { opacity: 0.88; }
    .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

    .spinner {
      width: 0.875rem; height: 0.875rem;
      border: 1.5px solid rgba(10,10,10,0.25);
      border-top-color: #0a0a0a; border-radius: 50%;
      animation: spin 0.65s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .auth-divider { display: flex; align-items: center; gap: 0.875rem; margin: 1.25rem 0; }
    .div-line { flex: 1; height: 1px; background: #1f1f1f; }
    .div-text { font-size: 0.7rem; color: rgba(255,255,255,0.22); font-weight: 400; }

    .btn-ghost {
      width: 100%; padding: 0.68rem; background: transparent;
      color: rgba(255,255,255,0.6); border: 1px solid #272727;
      font-family: Inter, -apple-system, sans-serif;
      font-size: 0.82rem; font-weight: 500; cursor: pointer;
      transition: border-color 0.15s, color 0.15s;
      text-align: center; display: block; text-decoration: none;
    }

    .btn-ghost:hover { border-color: #444; color: #fff; }

    .back-link {
      display: block; text-align: center; margin-top: 1.1rem;
      font-size: 0.75rem; color: rgba(255,255,255,0.25);
      text-decoration: none; transition: color 0.15s;
    }

    .back-link:hover { color: rgba(255,255,255,0.6); }

    .error-banner {
      background: rgba(220,60,50,0.08); border: 1px solid rgba(220,60,50,0.18);
      border-left: 2px solid rgba(220,80,60,0.7);
      padding: 0.75rem 0.875rem; display: flex;
      align-items: flex-start; gap: 0.6rem;
      margin-bottom: 1rem; grid-column: 1 / -1;
    }

    .error-title {
      font-size: 0.7rem; font-weight: 500; letter-spacing: 0.06em;
      text-transform: uppercase; color: rgba(240,100,80,0.9); margin-bottom: 0.12rem;
    }

    .error-msg { font-size: 0.8rem; color: rgba(240,130,110,0.85); line-height: 1.4; }

    /* Success */
    .success-root {
      min-height: 100vh; background: #0a0a0a;
      display: flex; align-items: center; justify-content: center;
      padding: 2rem; font-family: Inter, -apple-system, sans-serif;
    }

    .success-card {
      max-width: 420px; width: 100%;
      background: #111; border: 1px solid #1f1f1f;
      padding: 3rem 2.5rem; text-align: center;
    }

    .success-icon {
      width: 3rem; height: 3rem; background: rgba(255,255,255,0.05);
      border: 1px solid #2a2a2a; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .success-heading {
      font-size: 1.3rem; font-weight: 600; color: #fff;
      letter-spacing: -0.02em; margin-bottom: 0.5rem;
    }

    .success-divider { width: 2rem; height: 1px; background: #2a2a2a; margin: 1rem auto; }

    .success-text {
      font-size: 0.82rem; color: rgba(255,255,255,0.38);
      line-height: 1.6; margin-bottom: 1.75rem;
    }

    .success-btn {
      display: inline-block; padding: 0.7rem 2rem;
      background: #fff; color: #0a0a0a; text-decoration: none;
      font-size: 0.82rem; font-weight: 600; letter-spacing: 0.01em;
      transition: opacity 0.15s;
    }

    .success-btn:hover { opacity: 0.88; }

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
              <CheckCircle2 size={18} color="rgba(255,255,255,0.7)" />
            </div>
            <h2 className="success-heading">
              {emailVerify ? "Check your inbox" : "You're all set"}
            </h2>
            <div className="success-divider" />
            <p className="success-text">
              {emailVerify
                ? "We sent a confirmation link to your email. Click it to activate your account and start reading."
                : "Your account has been created. Redirecting to your dashboard…"}
            </p>
            {emailVerify && (
              <Link href="/auth/login" className="success-btn">
                Go to Login
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
            <div className="su-dots" />
            <div className="su-fade" />
            <div className="su-top">
              <p className="su-eyebrow">Get started</p>
              {steps.map((s, i) => (
                <div key={i} className={`step-item${s.active ? " active" : ""}`}>
                  <div className="step-icon">{s.icon}</div>
                  <div>
                    <p className="step-title">{s.title}</p>
                    <p className="step-sub">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="su-bottom">
              <p className="su-wordmark">Scriptum Mens Lumen</p>
              <p className="su-tagline">The light of the written mind</p>
            </div>
          </div>

          <div className="su-right">
            <h1 className="form-heading">Create account</h1>
            <p className="form-subheading">Join thousands of readers and writers on SML.</p>

            <form onSubmit={handleSignup}>
              <div className="form-grid">
                {error && (
                  <div className="error-banner full">
                    <AlertCircle size={14} color="rgba(240,100,80,0.9)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p className="error-title">Signup failed</p>
                      <p className="error-msg">{error}</p>
                    </div>
                  </div>
                )}

                <div className="form-group full">
                  <label className="field-label">Full name</label>
                  <input
                    type="text" value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required className="field-input" placeholder="John Doe"
                  />
                </div>

                <div className="form-group full">
                  <label className="field-label">Email</label>
                  <input
                    type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required className="field-input" placeholder="you@example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="field-label">Password</label>
                  <div className="input-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      required minLength={6}
                      className="field-input with-icon" placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="toggle-btn">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <p className="field-hint">Min. 6 characters</p>
                </div>

                <div className="form-group">
                  <label className="field-label">Confirm password</label>
                  <div className="input-wrap">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      required className="field-input with-icon" placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="toggle-btn">
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <><div className="spinner" /> Creating account…</>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="auth-divider">
              <div className="div-line" />
              <span className="div-text">or</span>
              <div className="div-line" />
            </div>

            <Link href="/auth/login" className="btn-ghost">Sign in instead</Link>
            <Link href="/" className="back-link">← Back to home</Link>
          </div>
        </div>
      </div>
    </>
  );
}