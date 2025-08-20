import React from 'react'
import './useErrorMail.css'

/**
 * useErrorMail - Custom hook for rendering error tooltips for form fields
 * @returns {function} renderErrorTooltip(fieldName, errors)
 *
 * Usage:
 * const { renderErrorTooltip } = useErrorMail()
 * ...
 * {renderErrorTooltip('purpose', errors)}
 */
export function useErrorMail() {
  function renderErrorTooltip(field, errors) {
    return (
      <div className="input-error-tooltip-wrapper">
        {errors[field] && (
          <span className="input-error-tooltip">
            <img src="/src/assets/win7/icons/warning.ico" alt="warning" />
            {errors[field]}
          </span>
        )}
      </div>
    )
  }
  return { renderErrorTooltip }
}
