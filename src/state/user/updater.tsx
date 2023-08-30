import { useEffect } from 'react'
import { useAppDispatch } from 'state'

import { toBN } from 'utils/numbers'
import { updateMatchesDarkMode } from './actions'
import { useSetSlippageToleranceCallback, useSlippageTolerance } from './hooks'

export default function Updater(): null {
  const dispatch = useAppDispatch()

  const userSlippage = useSlippageTolerance()
  const setSlippage = useSetSlippageToleranceCallback()

  useEffect(() => {
    if (toBN(userSlippage).isNaN()) {
      setSlippage(2)
    }
  }, [userSlippage, setSlippage])

  // keep dark mode in sync with the system
  useEffect(() => {
    const darkHandler = (match: MediaQueryListEvent) => {
      dispatch(updateMatchesDarkMode({ matchesDarkMode: match.matches }))
    }

    const match = window?.matchMedia('(prefers-color-scheme: dark)')
    dispatch(updateMatchesDarkMode({ matchesDarkMode: match.matches }))

    if (match?.addListener) {
      match?.addListener(darkHandler)
    } else if (match?.addEventListener) {
      match?.addEventListener('change', darkHandler)
    }

    return () => {
      if (match?.removeListener) {
        match?.removeListener(darkHandler)
      } else if (match?.removeEventListener) {
        match?.removeEventListener('change', darkHandler)
      }
    }
  }, [dispatch])

  return null
}
