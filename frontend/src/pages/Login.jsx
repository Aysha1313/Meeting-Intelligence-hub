import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [animationStep, setAnimationStep] = useState(0); // 0: MI, 1: Expands, 2: Login form
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Step 0 -> Step 1: Expand MI after 1 second
    const t1 = setTimeout(() => setAnimationStep(1), 1200);
    
    // Step 1 -> Step 2: Show login form after expansion is done (~1.5s)
    const t2 = setTimeout(() => setAnimationStep(2), 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userName', name || 'Guest');
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="login-page">
      <div className="content-container">
        {/* Logo Expansion Section */}
        <div className={`logo-expansion ${animationStep >= 2 ? 'position-top' : ''}`}>
          <div className="text-wrapper">
            <span className="logo-m">M</span>
            <span className={`expanded-text ${animationStep >= 1 ? 'visible' : ''}`}>eeting</span>
            <span className="logo-i">I</span>
            <span className={`expanded-text ${animationStep >= 1 ? 'visible' : ''}`}>ntelligence</span>
          </div>
        </div>

        {/* Login Form Section */}
        <div className={`login-box ${animationStep === 2 ? 'visible' : ''}`}>
          <h2>Welcome</h2>
          <p>Sign in to your meeting intelligence hub.</p>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. John Doe"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe123"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              Log In
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .login-page {
          width: 100vw;
          height: 100vh;
          background: radial-gradient(circle at center, #111118 0%, var(--bg-canvas) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          color: white;
          font-family: 'Sora', sans-serif;
        }

        .content-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 450px;
          height: auto;
        }

        /* Logo Expansion Styles */
        .logo-expansion {
          font-size: 5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          transition: all 0.8s var(--ease-smooth);
        }

        .logo-expansion.position-top {
          transform: translateY(-40px) scale(0.6);
          opacity: 0.8;
          margin-bottom: 2rem;
        }

        .text-wrapper {
          display: flex;
          align-items: baseline;
          justify-content: center;
          letter-spacing: -0.02em;
          width: 100%;
        }

        .logo-m, .logo-i {
          color: #FFFFFF;
          display: inline-block;
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.4), 0 0 60px rgba(99, 102, 241, 0.2);
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
        }

        .expanded-text {
          max-width: 0;
          overflow: hidden;
          opacity: 0;
          display: inline-block;
          font-weight: 300;
          white-space: nowrap;
          transition: max-width 1.2s var(--ease-smooth), opacity 0.8s ease, margin 1.2s var(--ease-smooth);
          color: white;
        }

        .expanded-text.visible {
          max-width: 400px;
          opacity: 1;
          margin: 0 0.5rem; /* Symmetric margin for middle expansion */
        }

        .logo-i {
          margin-left: 0;
        }

        /* Login Box Styles */
        .login-box {
          width: 100%;
          background: rgba(17, 17, 24, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          opacity: 0;
          transform: translateY(30px) scale(0.98);
          transition: all 0.8s var(--ease-smooth);
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.6);
        }

        .login-box.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .login-box h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .login-box p {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          font-size: 1rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .login-form .btn-primary {
          margin-top: 1rem;
          background: var(--accent);
          color: white;
          padding: 1rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 1rem;
          transition: background 0.3s;
        }

        .login-form .btn-primary:hover {
          background: var(--accent-hover);
        }

        @media (max-width: 768px) {
          .logo-expansion { font-size: 3rem; }
          .login-box { padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default Login;
