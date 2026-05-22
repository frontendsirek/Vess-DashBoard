/** UI connection state for remote control picker + session gating. */
export type RemoteControlConnectionState = 'online' | 'warning' | 'offline'

/** Device row / session header for Remote Device Control (mapped from device API). */
export type RemoteControlDevice = {
  id: string
  name: string
  model: string
  location: string
  state: RemoteControlConnectionState
  battery: number
  network: string
  signal: string
  lastTest: string
}
