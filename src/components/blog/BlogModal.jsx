import React, { useEffect, useState } from 'react'
import ModalWindow from '../modal/ModalWindow.jsx'
import { BlogAssistantForm } from './BlogAssistantForm.jsx'
import { BlogResultModal } from './BlogResultModal/BlogResultModal.jsx'
import { buildPrompt } from './utils/buildPrompt.js'
import { extractTitle, extractIntro, extractBody, extractConclusion, cleanBlogText } from './utils/blogUtils.js'
import { useErrorMail } from '../../utils/ErrorHandler/useErrorMail.jsx'
import ErrorModal from '../modal/ErrorModal.jsx'
import './BlogAssistantForm.css'
import './BlogResultModal/EditBlogModal/EditBlogModal.css'

export function BlogModal({ open, onClose, zIndex = 130, onActivate, onMinimize, playError }) {
  const { renderErrorTooltip } = useErrorMail()
  const [errors, setErrors] = useState({})
  const [installStep, setInstallStep] = useState(0)
  const [form, setForm] = useState({
    topic: '',
    targetAudience: '',
    wordCount: '',
    tone: '',
    seoFocus: '',
    expertiseLevel: ''
  })
  const [blogResult, setBlogResult] = useState(null)
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
    if (blogResult && !blogResult.error && blogResult.title && blogResult.intro && blogResult.body && blogResult.conclusion) {
      setEditableTitle(blogResult.title)
      setEditableIntro(blogResult.intro)
      setEditableBody(blogResult.body)
      setEditableConclusion(blogResult.conclusion)
      setEditableWordCount(blogResult.wordCount || 0)
      setEditableWarning(blogResult.warning || '')
      setResultModalOpen(true)
      setLoading(false)
      setGenerating(false)
    }
  }, [blogResult])

  useEffect(() => {
    if (blogResult && blogResult.error) {
      setErrorMessage(blogResult.error)
      setErrorModalOpen(true)
      setLoading(false)
    }
  }, [blogResult])

  if (!open) return null

  return (
    <>
      <ModalWindow
        title={installStep === 0 ? 'Installing Blog Assistant...' : 'Blog Post Generator'}
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
            <BlogAssistantForm
              form={form}
              setForm={setForm}
              errors={errors}
              setErrors={setErrors}
              setLoading={setLoading}
              setBlogResult={setBlogResult}
              buildPrompt={buildPrompt}
              extractTitle={extractTitle}
              extractIntro={extractIntro}
              extractBody={extractBody}
              extractConclusion={extractConclusion}
              cleanBlogText={cleanBlogText}
              loading={generating}
              renderErrorTooltip={renderErrorTooltip}
              onStartGenerate={() => setGenerating(true)}
              setGenerating={setGenerating}
              blogResult={blogResult}
              playError={playError}
            />
          </>
        )}
      </ModalWindow>
      {resultModalOpen && (
        <BlogResultModal
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
            setBlogResult({ title, intro, body, conclusion })
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
          onClose={() => { setErrorModalOpen(false); setBlogResult(null) }}
          zIndex={zIndex + 100}
        />
      )}
    </>
  )
}
