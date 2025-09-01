import React, { useEffect, useState } from 'react'
import ModalWindow from '../modal/ModalWindow.jsx'
import { SocialAssistantForm } from './SocialAssistantForm.jsx'
import { SocialResultModal } from './SocialResultModal/SocialResultModal.jsx'
import { buildPrompt } from './utils/buildPrompt.js'
import { extractPosts, extractHashtags, cleanSocialText } from './utils/socialUtils.js'
import { useErrorMail } from '../../utils/ErrorHandler/useErrorMail.jsx'
import ErrorModal from '../modal/ErrorModal.jsx'
import '../blog/BlogAssistantForm.css'

export function SocialModal({ open, onClose, zIndex = 130, onActivate, onMinimize }) {
  const { renderErrorTooltip } = useErrorMail()
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    productService: '',
    platform: '',
    goal: '',
    tone: '',
    cta: '',
    length: ''
  })
  const [socialResult, setSocialResult] = useState(null)
  const [, setLoading] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [generating, setGenerating] = useState(false)
  const [resultModalOpen, setResultModalOpen] = useState(false)
  const [editablePosts, setEditablePosts] = useState([])
  const [editableHashtags, setEditableHashtags] = useState([])

  useEffect(() => {
    if (socialResult && !socialResult.error && socialResult.posts && socialResult.posts.length >= 1) {
      setEditablePosts(socialResult.posts)
      setEditableHashtags(socialResult.hashtags || [])
      setResultModalOpen(true)
      setLoading(false)
      setGenerating(false)
    } 
  }, [socialResult])

  useEffect(() => {
    if (socialResult && socialResult.error) {
      setErrorMessage(socialResult.error)
      setErrorModalOpen(true)
      setLoading(false)
      setGenerating(false)
    }
  }, [socialResult])

  if (!open) return null

  return (
    <>
      <ModalWindow
        title="Social Media Post Generator"
        onClose={onClose}
        zIndex={zIndex}
        onActivate={onActivate}
        onMinimize={onMinimize}
      >
        <SocialAssistantForm
          form={form}
          setForm={setForm}
          errors={errors}
          setErrors={setErrors}
          setLoading={setLoading}
          setSocialResult={setSocialResult}
          buildPrompt={buildPrompt}
          extractPosts={extractPosts}
          extractHashtags={extractHashtags}
          cleanSocialText={cleanSocialText}
          loading={generating}
          renderErrorTooltip={renderErrorTooltip}
          onStartGenerate={() => setGenerating(true)}
          setGenerating={setGenerating}
          socialResult={socialResult}
        />
      </ModalWindow>
      {resultModalOpen && (
        <SocialResultModal
          open={resultModalOpen}
          onClose={() => setResultModalOpen(false)}
          zIndex={zIndex + 10}
          onActivate={onActivate}
          posts={editablePosts}
          setPosts={setEditablePosts}
          hashtags={editableHashtags}
          setHashtags={setEditableHashtags}
          onSave={({ posts, hashtags }) => {
            setSocialResult({ posts, hashtags })
            setResultModalOpen(false)
          }}
        />
      )}
      {errorModalOpen && (
        <ErrorModal
          open={errorModalOpen}
          message={errorMessage}
          onClose={() => { setErrorModalOpen(false); setSocialResult(null) }}
          zIndex={zIndex + 100}
        />
      )}
    </>
  )
}
