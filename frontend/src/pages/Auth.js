import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AppIcons } from '../components/UiIcons';

export default function Auth() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const LogoIcon = AppIcons.logo;

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    
    if (result.success) { 
      if (result.isNewUser) {
        toast.success('Account created! Welcome to MediRun!');
      } else {
        toast.success('Welcome back!'); 
      }
      navigate('/'); 
    }
    else if (result.message) {
      toast.error(result.message);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.logo}><LogoIcon size={24} /> MediRun</div>
        <h2 style={styles.title}>Welcome</h2>
        <p style={styles.subtitle}>Sign in or create an account quickly and securely with Google.</p>

        <button 
          type="button" 
          className="btn btn-full btn-lg" 
          style={styles.googleBtn} 
          onClick={handleGoogle} 
          disabled={googleLoading}
        >
          <FcGoogle size={22} />
          {googleLoading ? 'Connecting…' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrap: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--gray-50)', padding:20 },
  card: { background:'#fff', borderRadius:16, border:'1px solid var(--gray-200)', padding:'48px 36px', width:'100%', maxWidth:400, boxShadow:'var(--shadow)', textAlign:'center' },
  logo: { fontSize:24, fontWeight:700, color:'var(--teal)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:16 },
  title: { fontSize:22, fontWeight:700, marginBottom:8, color:'var(--gray-700)' },
  subtitle: { fontSize:14, color:'var(--gray-500)', marginBottom:32, lineHeight:1.5 },
  googleBtn: { display:'flex', alignItems:'center', justifyContent: 'center', gap:12, background:'#fff', color:'var(--gray-700)', border:'1.5px solid var(--gray-200)', fontWeight: 600, padding: '12px 20px' },
};