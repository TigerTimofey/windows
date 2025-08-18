import { useEffect, useState, useCallback } from 'react'

export function useClock(intervalMinutes = 1) {
  const getTimeString = useCallback(() => {
    const now = new Date()
    let hours = now.getHours()
    const minutes = now.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    const minStr = minutes < 10 ? '0' + minutes : minutes
    return `${hours}:${minStr} ${ampm}`
  }, [])

  const [time, setTime] = useState(getTimeString())

  useEffect(() => {
    setTime(getTimeString())
    const id = setInterval(() => setTime(getTimeString()), 1000 * 60 * intervalMinutes)
    return () => clearInterval(id)
  }, [getTimeString, intervalMinutes])

  return time
}
