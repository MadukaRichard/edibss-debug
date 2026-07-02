import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AppIcons } from '../../components/UiIcons';

export default function PaymentSettingsCMS() {
  const [bank, setBank] = useState({ bankName:'', accountNumber:'', accountName:'', note:'' });
  const [saving, setSaving] = useState(false);
  const SaveIcon = AppIcons.payment;

  useEffect(() => {
    api.get('/admin/site-content').then(({ data }) => {
      const entry = data.find(d => d.key === 'bankDetails');
      if (entry?.value) setBank(b => ({ ...b, ...entry.value }));
    }).catch(() => {});
  }, []);

  const set = (k, v) => setBank(b => ({ ...b, [k]: v }));

  const save = async () => {
    if (!bank.accountNumber || !bank.bankName || !bank.accountName) return toast.error('Bank name, account number and account name are required');
    setSaving(true);
    try {
      await api.put('/admin/site-content/bankDetails', { value: bank, label: 'Bank transfer details' });
      toast.success('Bank details saved — customers will now see this at checkout');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div style={styles.head}>
        <h1 style={styles.pageTitle}>Payment Settings</h1>
        <button className="btn btn-primary" onClick={save} disabled={saving}><SaveIcon size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />{saving ? 'Saving…' : 'Save'}</button>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sHead}><AppIcons.payment size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Manual bank transfer account</h2>
        <p style={{ fontSize:13, color:'var(--gray-500)', marginBottom:16 }}>
          Customers who choose "Bank transfer" at checkout will see these details. Orders paid this way stay
          <strong> Awaiting payment confirmation</strong> until you confirm the transfer in Orders — only then is a rider assigned.
        </p>
        <div className="form-row">
          <div className="form-group"><label>Bank name</label><input value={bank.bankName} onChange={e=>set('bankName',e.target.value)} placeholder="e.g. GTBank" /></div>
          <div className="form-group"><label>Account number</label><input value={bank.accountNumber} onChange={e=>set('accountNumber',e.target.value)} placeholder="0123456789" /></div>
        </div>
        <div className="form-group"><label>Account name</label><input value={bank.accountName} onChange={e=>set('accountName',e.target.value)} placeholder="MediRun Pharmacy Ltd" /></div>
        <div className="form-group"><label>Note shown to customer (optional)</label><input value={bank.note} onChange={e=>set('note',e.target.value)} placeholder="Please use your order number as the transfer reference" /></div>

        {bank.accountNumber && (
          <div style={styles.preview}>
            <div style={styles.pRow}><span>Bank</span><strong>{bank.bankName}</strong></div>
            <div style={styles.pRow}><span>Account number</span><strong>{bank.accountNumber}</strong></div>
            <div style={styles.pRow}><span>Account name</span><strong>{bank.accountName}</strong></div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  head: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  pageTitle: { fontSize:24, fontWeight:700, color:'var(--gray-700)' },
  section: { background:'#fff', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px', marginBottom:20 },
  sHead: { fontSize:16, fontWeight:700, marginBottom:12, color:'var(--gray-700)' },
  preview: { marginTop:16, background:'var(--teal-lt)', borderRadius:10, padding:'14px 16px' },
  pRow: { display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--gray-700)', marginBottom:6 },
};
