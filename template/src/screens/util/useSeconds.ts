import { useState, useEffect } from 'react'

export interface ITimeInSeconds {
  minutes: number
  hours: number
  seconds: number
}

export function useSeconds (): ITimeInSeconds {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const inte = setInterval(() => {
      const newTime = new Date()
      if (
        newTime.getSeconds() !== time.getSeconds() ||
        newTime.getMinutes() !== time.getMinutes() ||
        newTime.getHours() !== time.getHours()
      ) {
        setTime(newTime)
      }
    }, 80)
    return () => {
      clearInterval(inte)
    }
  }, [])
  return {
    hours: time.getHours(),
    minutes: time.getMinutes(),
    seconds: time.getSeconds()
  }
}
