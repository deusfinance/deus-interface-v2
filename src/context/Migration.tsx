import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { makeHttpRequest } from 'utils/http'

export const MigrationData = createContext<Record<string, string>>({})

export const MigrationWrap = ({ children }: { children: React.ReactNode }) => {
  const getMigrationData = useCallback(async () => {
    try {
      const res = await makeHttpRequest(`https://info.deus.finance/symm/v1/info`)
      if (res?.status === 'error') {
        return null
      } else {
        return res
      }
    } catch (error) {
      return null
    }
  }, [])

  const [state, dispatch] = useState({})

  useEffect(() => {
    getMigrationData().then((response) => dispatch(response))
  }, [])

  return <MigrationData.Provider value={state}>{children}</MigrationData.Provider>
}

export const useMigrationData = () => useContext(MigrationData)
