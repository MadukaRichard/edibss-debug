import React from 'react';
import { StatusIcon } from './UiIcons';

const STEPS = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'in_transit', label: 'In transit' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_ORDER = ['confirmed','preparing','in_transit','delivered'];

export default function OrderTracker({ status }) {
  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div style={styles.wrap}>
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={step.key}>
            <div style={styles.step}>
              <div style={{ ...styles.dot, ...(done ? styles.done : active ? styles.active : styles.idle) }}>
                <StatusIcon status={step.key} size={18} />
              </div>
              <div style={{ ...styles.label, ...(active ? { color: 'var(--teal)', fontWeight: 600 } : {}) }}>{step.label}</div>
            </div>
            {i < STEPS.length - 1 && <div style={{ ...styles.line, ...(done ? styles.lineDone : {}) }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', alignItems: 'flex-start', padding: '8px 0' },
  step: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 60 },
  dot: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, transition: 'all 0.3s' },
  done: { background: 'var(--teal)', color: '#fff' },
  active: { background: 'var(--amber)', color: '#fff', boxShadow: '0 0 0 4px rgba(186,117,23,0.2)' },
  idle: { background: 'var(--gray-100)', color: 'var(--gray-500)', border: '2px solid var(--gray-200)' },
  label: { fontSize: 11, color: 'var(--gray-500)', textAlign: 'center' },
  line: { flex: 1, height: 3, background: 'var(--gray-200)', borderRadius: 4, alignSelf: 'center', marginBottom: 20 },
  lineDone: { background: 'var(--teal)' },
};
