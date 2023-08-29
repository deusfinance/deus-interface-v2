import ApplicationUpdater from './application/updater'
import TransactionUpdater from './transactions/updater'
import UserUpdater from './user/updater'
import DashboardUpdater from './dashboard/updater'

export default function Updaters() {
  return (
    <>
      <ApplicationUpdater />
      <TransactionUpdater />
      <UserUpdater />
      <DashboardUpdater />
    </>
  )
}
