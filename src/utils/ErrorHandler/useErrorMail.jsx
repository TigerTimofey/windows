import React from 'react'
import './useErrorMail.css'
import warningIcon from '../../assets/win7/icons/warning.ico'

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
            <img src={warningIcon} alt="warning" />
            {errors[field]}
          </span>
        )}
      </div>
    )
  }
  return { renderErrorTooltip }
}
