import React, { useEffect, useState } from 'react'
import ModalWindow from '../modal/ModalWindow.jsx'
import { StoryAssistantForm } from './StoryAssistantForm.jsx'
import { StoryAssistantResult } from './StoryAssistantResult.jsx'
import { StoryResultModal } from './StoryResultModal/StoryResultModal.jsx'
import { buildPrompt } from './utils/buildPrompt.js'
import { extractTitle, extractIntro, extractBody, extractConclusion, cleanStoryText } from './utils/storyUtils.js'
import { useErrorMail } from '../../utils/ErrorHandler/useErrorMail.jsx'
import ErrorModal from '../modal/ErrorModal.jsx'
import '../blog/BlogAssistantForm.css'
import './StoryResultModal/EditStoryModal/EditStoryModal.css'

export function StoryModal({ open, onClose, zIndex = 130, onActivate, onMinimize }) {
  const { renderErrorTooltip } = useErrorMail()
  const [errors, setErrors] = useState({})
  const [installStep, setInstallStep] = useState(0)
  const [form, setForm] = useState({
    genre: '',
    characters: '',
    setting: '',
    length: '',
    style: '',
    targetAudience: '',
    mood: ''
  })
  const [storyResult, setStoryResult] = useState(null)
  const [, setLoading] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [generating, setGenerating] = useState(false)
  const [resultModalOpen, setResultModalOpen] = useState(false)
  const [editableTitle, setEditableTitle] = useState('')
  const [editableIntro, setEditableIntro] = useState('')
  const [editableBody, setEditableBody] = useState('')
  const [editableConclusion, setEditableConclusion] = useState('')
  const [editableWordCount, setEditableWordCount] = useState(0)
  const [editableWarning, setEditableWarning] = useState('')

  useEffect(() => {
    if (open) setInstallStep(0)
  }, [open])

  useEffect(() => {
    if (storyResult && !storyResult.error && storyResult.title && storyResult.intro && storyResult.body && storyResult.conclusion) {
      setEditableTitle(storyResult.title)
      setEditableIntro(storyResult.intro)
      setEditableBody(storyResult.body)
      setEditableConclusion(storyResult.conclusion)
      setEditableWordCount(storyResult.wordCount || 0)
      setEditableWarning(storyResult.warning || '')
      setResultModalOpen(true)
      setLoading(false)
      setGenerating(false)
    }
  }, [storyResult])

  useEffect(() => {
    if (storyResult && storyResult.error) {
      setErrorMessage(storyResult.error)
      setErrorModalOpen(true)
      setLoading(false)
    }
  }, [storyResult])

  if (!open) return null

  return (
    <>
      <ModalWindow
        title={installStep === 0 ? 'Installing Story Assistant...' : 'Short Story Generator'}
        onClose={onClose}
        zIndex={zIndex}
        onActivate={onActivate}
        onMinimize={onMinimize}
      >
        {installStep === 0 ? (
          <div className="blog-assistant-install">
            <p className="blog-assistant-install-text">Preparing components...</p>
            <div className="blog-assistant-progress-bar">
              <div
                className="blog-assistant-progress"
                onAnimationEnd={() => setInstallStep(1)}
              />
            </div>
          </div>
        ) : (
          <>
            <StoryAssistantForm
              form={form}
              setForm={setForm}
              errors={errors}
              setErrors={setErrors}
              setLoading={setLoading}
              setStoryResult={setStoryResult}
              buildPrompt={buildPrompt}
              extractTitle={extractTitle}
              extractIntro={extractIntro}
              extractBody={extractBody}
              extractConclusion={extractConclusion}
              cleanStoryText={cleanStoryText}
              loading={generating}
              renderErrorTooltip={renderErrorTooltip}
              onStartGenerate={() => setGenerating(true)}
              storyResult={storyResult}
            />
            <StoryAssistantResult storyResult={storyResult} />
          </>
        )}
      </ModalWindow>
      {resultModalOpen && (
        <StoryResultModal
          open={resultModalOpen}
          onClose={() => setResultModalOpen(false)}
          zIndex={zIndex + 10}
          onActivate={onActivate}
          title={editableTitle}
          setTitle={setEditableTitle}
          intro={editableIntro}
          setIntro={setEditableIntro}
          body={editableBody}
          setBody={setEditableBody}
          conclusion={editableConclusion}
          setConclusion={setEditableConclusion}
          onSave={({ title, intro, body, conclusion }) => {
            setStoryResult({ title, intro, body, conclusion })
            setResultModalOpen(false)
          }}
          wordCount={editableWordCount}
          warning={editableWarning}
        />
      )}
      {errorModalOpen && (
        <ErrorModal
          open={errorModalOpen}
          message={errorMessage}
          onClose={() => { setErrorModalOpen(false); setStoryResult(null) }}
          zIndex={zIndex + 100}
        />
      )}
    </>
  )
}
