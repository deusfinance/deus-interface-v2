import ApplicationUpdater from './application/updater'
import TransactionUpdater from './transactions/updater'
import UserUpdater from './user/updater'
import DashboardUpdater from './dashboard/updater'
import { MulticallUpdater } from 'lib/state/multicall'

export default function Updaters() {
  return (
    <>
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
      <UserUpdater />
      <DashboardUpdater />
    </>
  )
}
