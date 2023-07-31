import { getDefaultConfig } from 'connectkit'
import { createConfig } from 'wagmi'

const walletConnectProjectId = '6f26f99d86d880b561988f69808456d3'

export const config = createConfig(
  getDefaultConfig({
    autoConnect: true,
    appName: 'My wagmi + ConnectKit App',
    walletConnectProjectId,
  })
)
