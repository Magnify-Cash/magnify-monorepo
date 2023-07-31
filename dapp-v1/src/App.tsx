import { ConnectKitButton } from 'connectkit'
import { useAccount } from 'wagmi'

export function App() {
  const { isConnected } = useAccount()
  return (
    <>
      <h1>wagmi + ConnectKit + Vite</h1>
      <ConnectKitButton />
    </>
  )
}
