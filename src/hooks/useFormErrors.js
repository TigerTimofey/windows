import { useState } from 'react'

/**
 * useFormErrors - Custom hook for managing form field errors and validation
 * @param {Object} initialFields - Object with field names as keys and initial values
 * @returns {Object} { errors, validate, setErrors, clearErrors }
 *
 * Usage:
 * const { errors, validate, setErrors, clearErrors } = useFormErrors(form)
 * validate({ purpose: v => !v.trim() && 'Please provide the purpose.' })
 */
export function useFormErrors(fields) {
  const [errors, setErrors] = useState({})

  function validate(validators) {
    const newErrors = {}
    for (const key in validators) {
      const error = validators[key](fields[key])
      if (error) newErrors[key] = error
    }
    setErrors(newErrors)
    return newErrors
  }

  function clearErrors() {
    setErrors({})
  }

  return { errors, validate, setErrors, clearErrors }
}
