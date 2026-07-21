import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AppIcons } from '../components/UiIcons';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', phone:'+234 ', password:'' });
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, register, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const LogoIcon = AppIcons.logo;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = mode === 'login' ? await login(form.email, form.password) : await register(form);
    if (result.success) { toast.success(mode==='login'?'Welcome back!':'Account created!'); navigate('/'); }
    else toast.error(result.message);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    
    if (result.success) { 
      if (result.isNewUser) {
        // A clean, simple welcome for brand new users!
        toast.success('Account created! Welcome to MediRun!');
      } else {
        toast.success('Welcome back!'); 
      }
      navigate('/'); 
    }
    else if (result.message) toast.error(result.message);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.logo}><LogoIcon size={22} /> MediRun</div>
        <h2 style={styles.title}>{mode==='login' ? 'Sign in to your account' : 'Create an account'}</h2>

        <button type="button" className="btn btn-full btn-lg" style={styles.googleBtn} onClick={handleGoogle} disabled={googleLoading}>
          <FcGoogle size={20} />
          {googleLoading ? 'Please wait…' : 'Continue with Google'}
        </button>

        <div style={styles.divider}><span style={styles.dividerLine} /><span style={styles.dividerText}>or</span><span style={styles.dividerLine} /></div>

        <form onSubmit={handleSubmit}>
          {mode==='register' && (
            <div className="form-group">
              <label>Full name</label>
              <input placeholder="Adaeze Okonkwo" value={form.name} onChange={e=>set('name',e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label>Email address</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)} required />
          </div>
          {mode==='register' && (
            <div className="form-group">
              <label>Phone number</label>
              <input placeholder="+234 801 234 5678" value={form.phone} onChange={e=>set('phone',e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e=>set('password',e.target.value)} required minLength={6} />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode==='login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={styles.switch}>
          {mode==='login' ? "Don't have an account? " : "Already have one? "}
          <button style={styles.switchBtn} onClick={() => setMode(m=>m==='login'?'register':'login')}>
            {mode==='login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrap: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--gray-50)', padding:20 },
  card: { background:'#fff', borderRadius:16, border:'1px solid var(--gray-200)', padding:'40px 36px', width:'100%', maxWidth:420, boxShadow:'var(--shadow)' },
  logo: { fontSize:22, fontWeight:700, color:'var(--teal)', textAlign:'center', marginBottom:24 },
  title: { fontSize:20, fontWeight:700, textAlign:'center', marginBottom:28, color:'var(--gray-700)' },
  switch: { textAlign:'center', marginTop:20, fontSize:14, color:'var(--gray-500)' },
  switchBtn: { color:'var(--teal)', fontWeight:600, background:'none', border:'none', cursor:'pointer', fontSize:14 },
  googleBtn: { display:'flex', alignItems:'center', justifyContent:'center', gap:10, background:'#fff', color:'var(--gray-700)', border:'1.5px solid var(--gray-200)', marginBottom:20 },
  divider: { display:'flex', alignItems:'center', gap:12, marginBottom:20 },
  dividerLine: { flex:1, height:1, background:'var(--gray-200)' },
  dividerText: { fontSize:12, color:'var(--gray-500)' },
};
