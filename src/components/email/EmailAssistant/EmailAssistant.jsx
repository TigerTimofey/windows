import React, { useEffect, useState } from 'react'
import ModalWindow from '../../modal/ModalWindow.jsx'
import { WinDropdown } from '../../../utils/WinDropdown/WinDropdown.jsx'
import './EmailAssistant.css'

export function EmailAssistant({ open, onClose, zIndex, onActivate }) {
  const [installStep, setInstallStep] = useState(0) // 0 installing, 1 form
  const [form, setForm] = useState({ purpose: '', recipientContext: '', keyPoints: '', tone: '', urgency: '', cta: '' })

  const toneOptions = ['Professional', 'Friendly', 'Formal', 'Casual', 'Persuasive', 'Empathetic']
  const urgencyOptions = ['Low', 'Normal', 'High', 'Critical']
  const ctaOptions = ['Schedule a Call', 'Reply to Confirm', 'Visit Website', 'Download Attachment', 'Approve Request', 'Provide Feedback']

  // Reset state when opened
  useEffect(() => {
    if (open) {
      // Reset to install step when reopened
      setInstallStep(0)
    }
  }, [open])

  if (!open) return null

  return (
    <ModalWindow
      title={installStep === 0 ? 'Installing Email Client...' : 'Email Assistant'}
      onClose={onClose}
      zIndex={zIndex}
      onActivate={onActivate}
    >
      {installStep === 0 ? (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <p style={{ marginBottom: 16 }}>Preparing components...</p>
          <div style={{ width: '80%', height: 16, border: '2px inset #fff', background: '#dcdcdc', margin: '0 auto', position: 'relative' }}>
            <div
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: '#1e4e8c', animation: 'emailProgress 1.05s linear forwards' }}
              onAnimationEnd={() => setInstallStep(1)}
            />
          </div>
        </div>
      ) : (
  <form className="email-form"
          onSubmit={e => { e.preventDefault(); /* placeholder for future generation */ }}>
          <label className="email-form-field">Purpose
            <input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} required />
          </label>
          <label className="email-form-field">Recipient Context
            <textarea value={form.recipientContext} onChange={e => setForm(f => ({ ...f, recipientContext: e.target.value }))} rows={2} />
          </label>
          <label className="email-form-field">Key Points / Messages
            <textarea value={form.keyPoints} onChange={e => setForm(f => ({ ...f, keyPoints: e.target.value }))} rows={3} />
          </label>
          <WinDropdown
            label="Tone"
            value={form.tone}
            onChange={v => setForm(f => ({ ...f, tone: v }))}
            options={toneOptions}
            placeholder="Select tone"
            required
          />
          <WinDropdown
            label="Urgency"
            value={form.urgency}
            onChange={v => setForm(f => ({ ...f, urgency: v }))}
            options={urgencyOptions}
            placeholder="Select urgency"
            required
          />
          <WinDropdown
            label="CTA"
            value={form.cta}
            onChange={v => setForm(f => ({ ...f, cta: v }))}
            options={ctaOptions}
            placeholder="Select CTA"
            required
          />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="modal-btn-text" onClick={onClose}>Close</button>
            <button type="submit" className="modal-btn-text"
              onClick={() => {
                // Log only user-provided raw data
                console.log('[EmailAssistant] User data:', {
                  purpose: form.purpose,
                  recipientContext: form.recipientContext,
                  keyPoints: form.keyPoints,
                  tone: form.tone,
                  urgency: form.urgency,
                  cta: form.cta
                })
              }}
            >Save</button>
          </div>
        </form>
      )}
    </ModalWindow>
  )
}
