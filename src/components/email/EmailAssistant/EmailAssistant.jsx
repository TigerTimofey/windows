import React, { useEffect, useState } from 'react'
import { buildPrompt } from '../utils/buildPrompt.js'
import { inferThemeFromMessage, cleanMessage, removeDuplicates } from '../utils/messageUtils.js'
import { useErrorMail } from '../../../utils/ErrorHandler/useErrorMail.jsx'
import ModalWindow from '../../modal/ModalWindow.jsx'
import { EmailAssistantForm } from '../FormResponse/EmailAssistantForm.jsx'
import { EmailResultModal } from '../FormResponse/EmailResultModal/EmailResultModal.jsx'
import './EmailAssistant.css'

export function EmailAssistant({ open, onClose, zIndex, onActivate, appName = 'Email Assistant' }) {
  const { renderErrorTooltip } = useErrorMail()
  const [errors, setErrors] = useState({})
  const [installStep, setInstallStep] = useState(0)
  const [form, setForm] = useState({
    contentType: 'Email',
    context: 'Welcome email for new developer Tim. Purpose: onboarding. Audience: Tim and HR Manager Jane Smith.',
    specifications: 'Max 120 words. Format: plain text. Platform: Gmail.',
    style: 'Tone: friendly, professional. Complexity: simple. Presentation: clear paragraphs.',
    generation: 'temperature=0.7, max_tokens=256'
  })
  const [emailResult, setEmailResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resultModalOpen, setResultModalOpen] = useState(false)
  const [editableTheme, setEditableTheme] = useState('')
  const [editableMessage, setEditableMessage] = useState('')

  useEffect(() => {
    if (open) setInstallStep(0)
  }, [open])

  useEffect(() => {
    if (
      emailResult &&
      !emailResult.error &&
      emailResult.theme &&
      emailResult.message &&
      emailResult.message !== '(none)'
    ) {
      setEditableTheme(emailResult.theme)
      setEditableMessage(emailResult.message)
      setResultModalOpen(true)
      setLoading(false) 
    }
  }, [emailResult])

  if (!open) return null

  return (
    <ModalWindow
      title={installStep === 0 ? 'Installing Email Client...' : appName}
      onClose={onClose}
      zIndex={zIndex}
      onActivate={onActivate}
    >
      {installStep === 0 ? (
        <div className="email-assistant-install">
          <p className="email-assistant-install-text">Preparing components...</p>
          <div className="email-assistant-progress-bar">
            <div
              className="email-assistant-progress"
              onAnimationEnd={() => setInstallStep(1)}
            />
          </div>
        </div>
      ) : (
        <>
          <EmailAssistantForm
            form={form}
            setForm={setForm}
            errors={errors}
            setErrors={setErrors}
            setLoading={setLoading}
            setEmailResult={setEmailResult}
            buildPrompt={buildPrompt}
            inferThemeFromMessage={inferThemeFromMessage}
            cleanMessage={cleanMessage}
            removeDuplicates={removeDuplicates}
            loading={loading}
            renderErrorTooltip={renderErrorTooltip}
          />
          {resultModalOpen && emailResult && emailResult.theme && emailResult.message && emailResult.message !== '(none)' && (
            <EmailResultModal
              open={resultModalOpen}
              onClose={() => setResultModalOpen(false)}
              theme={editableTheme}
              setTheme={setEditableTheme}
              message={editableMessage}
              setMessage={setEditableMessage}
              onSave={({ theme, message }) => {
                setEmailResult({ theme, message })
                setResultModalOpen(false)
              }}
              zIndex={zIndex + 10}
              onActivate={onActivate}
            />
          )}
        </>
      )}
    </ModalWindow>
  )
}