import { RemoteControlSessionView } from '@/components/remote-device-control/RemoteControlSessionView'
import {
  useEndRemoteControlSessionMutation,
  useEnsureRemoteControlSessionQuery,
  useSendRemoteCommandMutation,
} from '@/hooks/devices/use-remote-control-session'
import type { RemoteControlDevice } from '@/types/remote-device-control'

type RemoteControlSessionGateProps = {
  accessToken: string | null
  device: RemoteControlDevice
  onExitSession: () => void
}

export function RemoteControlSessionGate({
  accessToken,
  device,
  onExitSession,
}: RemoteControlSessionGateProps) {
  const sessionQuery = useEnsureRemoteControlSessionQuery(accessToken, device.id, true)
  const endSessionMutation = useEndRemoteControlSessionMutation(accessToken, device.id)
  const sendCommandMutation = useSendRemoteCommandMutation(
    accessToken,
    device.id,
    sessionQuery.data?.session,
  )

  const session = sessionQuery.data?.session ?? null

  async function handleEndSession() {
    if (session?.session_id) {
      await endSessionMutation.mutateAsync(session.session_id)
    }
    onExitSession()
  }

  function handleSendCommand(command: string, args?: Record<string, unknown>) {
    sendCommandMutation.mutate({ command, args })
  }

  if (sessionQuery.isPending) {
    return (
      <section className="rounded-2xl bg-vess-grey-50 p-6">
        <p className="text-center text-[15px] text-vess-grey-600">Starting remote control session…</p>
      </section>
    )
  }

  if (sessionQuery.isError) {
    const message =
      sessionQuery.error instanceof Error ?
        sessionQuery.error.message
      : 'Could not start remote control session.'
    return (
      <section className="flex flex-col gap-4 rounded-2xl bg-vess-grey-50 p-6">
        <p className="text-center text-[15px] text-vess-red-800">{message}</p>
        <button
          type="button"
          onClick={onExitSession}
          className="mx-auto w-fit rounded-lg border border-vess-primary-500 bg-vess-grey-50 px-4 py-3 text-[15px] font-medium text-vess-primary-500"
        >
          Back to device list
        </button>
      </section>
    )
  }

  return (
    <RemoteControlSessionView
      device={device}
      modelLabel={device.model}
      session={session}
      onExitSession={() => void handleEndSession()}
      onSendCommand={handleSendCommand}
      isEnding={endSessionMutation.isPending}
      isCommandPending={sendCommandMutation.isPending}
    />
  )
}
