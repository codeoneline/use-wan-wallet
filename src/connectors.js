import {
  ProvidedConnector,
  UserRejectedRequestError as ProvidedUserRejectedRequestError,
} from '@aragon/provided-connector'
import { AuthereumConnector } from '@web3-react-wan/authereum-connector'
import { FortmaticConnector } from '@web3-react-wan/fortmatic-connector'
import {
  FrameConnector,
  UserRejectedRequestError as FrameUserRejectedRequestError,
} from '@web3-react-wan/frame-connector'
import {
  InjectedConnector,
  // NoEthereumProviderError as InjectedNoEthereumProviderError,
  UserRejectedRequestError as InjectedUserRejectedRequestError,
} from '@web3-react-wan/injected-connector'
import { PortisConnector } from '@web3-react-wan/portis-connector'
import { SquarelinkConnector } from '@web3-react-wan/squarelink-connector'
import { WalletLinkConnector } from '@web3-react-wan/walletlink-connector'
import {
  WanmaskConnector,
  UserRejectedRequestError as  WanmaskUserRejectedRequestError} from '@web3-react-wan/wanmask-connector'

import { ConnectionRejectedError, ConnectorConfigError } from './errors'

import {
  UserRejectedRequestError as WalletConnectUserRejectedRequestError,
  WalletConnectConnector,
} from '@web3-react-wan/walletconnect-connector'

// TODO: fix babel-runtime issue with torus-connector
import { TorusConnector } from '@web3-react-wan/torus-connector'

export function getConnectors(chainId, connectorsInitsOrConfigs = {}) {
  // Split the connector initializers from the confs.
  const [inits, configs] = Object.entries(connectorsInitsOrConfigs).reduce(
    ([inits, configs], [id, initOrConfig]) => {
      // Having a web3ReactConnector function is
      // the only prerequisite for an initializer.
      if (typeof initOrConfig.web3ReactConnector === 'function') {
        return [{ ...inits, [id]: initOrConfig }, configs]
      }
      return [inits, [...configs, [id, initOrConfig]]]
    },
    [{}, []]
  )

  const connectors = {
    wanmask: {
      web3ReactConnector({ chainId }) {
        return new WanmaskConnector({ supportedChainIds: [chainId] })
      },
      handleActivationError(err) {
        if (err instanceof WanmaskUserRejectedRequestError) {
          return new ConnectionRejectedError()
        }
      },
    },
  
    injected: {
      web3ReactConnector({ chainId }) {
        return new InjectedConnector({ supportedChainIds: [chainId] })
      },
      handleActivationError(err) {
        if (err instanceof InjectedUserRejectedRequestError) {
          return new ConnectionRejectedError()
        }
      },
    },
    frame: {
      web3ReactConnector({ chainId }) {
        return new FrameConnector({ supportedChainIds: [chainId] })
      },
      handleActivationError(err) {
        if (err instanceof FrameUserRejectedRequestError) {
          return new ConnectionRejectedError()
        }
        if (err.message.startsWith('JSON.parse')) {
          return new Error(
            'There seems to be an issue when trying to connect to Frame.'
          )
        }
      },
    },
    fortmatic: {
      web3ReactConnector({ chainId, apiKey }) {
        if (!apiKey) {
          throw new ConnectorConfigError(
            'The Fortmatic connector requires apiKey to be set.'
          )
        }
        return new FortmaticConnector({ apiKey, chainId })
      },
    },
    portis: {
      web3ReactConnector({ chainId, dAppId }) {
        if (!dAppId) {
          throw new ConnectorConfigError(
            'The Portis connector requires dAppId to be set.'
          )
        }
        return new PortisConnector({ dAppId, networks: [chainId] })
      },
    },
    provided: {
      web3ReactConnector({ chainId, provider }) {
        return new ProvidedConnector({
          provider,
          supportedChainIds: [chainId],
        })
      },
      handleActivationError(err) {
        if (err instanceof ProvidedUserRejectedRequestError) {
          return new ConnectionRejectedError()
        }
      },
    },
    authereum: {
      web3ReactConnector({ chainId }) {
        return new AuthereumConnector({ chainId })
      },
    },
    squarelink: {
      web3ReactConnector({ chainId, clientId, options }) {
        return new SquarelinkConnector({
          clientId,
          networks: [chainId],
          options,
        })
      },
    },
    torus: {
      web3ReactConnector({ chainId, initOptions, constructorOptions }) {
        return new TorusConnector({
          chainId,
          constructorOptions,
          initOptions,
        })
      },
    },
    walletconnect: {
      web3ReactConnector({ chainId, rpcUrl, bridge, pollingInterval }) {
        if (!rpcUrl) {
          throw new ConnectorConfigError(
            'The WalletConnect connector requires rpcUrl to be set.'
          )
        }
        if (!/^https?:\/\//.test(rpcUrl)) {
          throw new ConnectorConfigError(
            'The WalletConnect connector requires rpcUrl to be an HTTP URL.'
          )
        }
        return new WalletConnectConnector({
          bridge,
          pollingInterval,
          qrcode: true,
          rpc: { [chainId]: rpcUrl },
        })
      },
      handleActivationError(err) {
        if (err instanceof WalletConnectUserRejectedRequestError) {
          return new ConnectionRejectedError()
        }
      },
    },
    walletlink: {
      web3ReactConnector({ chainId, url, appName, appLogoUrl }) {
        if (chainId !== 1) {
          throw new ConnectorConfigError(
            'The WalletLink connector requires chainId to be 1.'
          )
        }
        if (!/^https?:\/\//.test(url)) {
          throw new ConnectorConfigError(
            'The WalletLink connector requires url to be an HTTP URL.'
          )
        }
        return new WalletLinkConnector({ url, appName, appLogoUrl })
      },
    },
    ...inits,
  }

  // Attach the configs to their connectors.
  for (const [id, config] of configs) {
    if (connectors[id]) {
      connectors[id].config = config
    }
  }

  return connectors
}