import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import {
  ConnectionRejectedError,
  UseWalletProvider,
  useWallet,
} from 'use-wan-wallet'

function App() {
  const wallet = useWallet()
  const blockNumber = wallet.getBlockNumber()
  // const { current: web3 } = useRef(new Web3(window.ethereum))

  const activate = connector => wallet.connect(connector)

  return (
    <>
      <h1>use-wan-wallet</h1>

      {(() => {
        if (wallet.error?.name) {
          return (
            <p>
              <span>
                {wallet.error instanceof ConnectionRejectedError
                  ? 'Connection error: the user rejected the activation'
                  : wallet.error.name}
              </span>
              <button onClick={wallet.reset()}>retry</button>
            </p>
          )
        }

        if (wallet.status === 'connecting') {
          return (
            <p>
              <span>Connecting to {wallet.connector}…</span>
              <button onClick={() => wallet.reset()}>cancel</button>
            </p>
          )
        }

        if (wallet.status === 'connected') {
          return (
            <p>
              <span>Connected.</span>
              <button onClick={() => wallet.reset()}>disconnect</button>
            </p>
          )
        }

        return (
          <div className="connect">
            <div className="connect-label">Connect:</div>
            <div className="connect-buttons">
              <button onClick={() => activate('injected')}>injected</button>
              <button onClick={() => activate('frame')}>frame</button>
              <button onClick={() => activate('portis')}>portis</button>
              <button onClick={() => activate('fortmatic')}>fortmatic</button>
              <button onClick={() => activate('torus')}>torus</button>
              <button onClick={() => activate('walletconnect')}>
                walletconnect
              </button>
              <button onClick={() => activate('wanmask')}>
                wanmask
              </button>
              <button onClick={() => activate('walletlink')}>walletlink</button>
            </div>
          </div>
        )
      })()}

      {wallet.connected && (
        <>
          <p>
            <span>Account:</span>
            <span>{wallet.account}</span>
          </p>
        </>
      )}

      {wallet.account && (
        <p>
          <span>Balance:</span>
          <span>{wallet.balance === '-1' ? '…' : `${wallet.balance} ETH`}</span>
        </p>
      )}

      {wallet.connected && (
        <p>
          <span>Block:</span> <span>{blockNumber || '…'}</span>
        </p>
      )}
    </>
  )
}

ReactDOM.render(
  <UseWalletProvider
    chainId={1,3}
    connectors={{
      fortmatic: { apiKey: '' },
      portis: { dAppId: '' },
      walletconnect: { rpcUrl: 'https://mainnet.eth.aragon.network/' },
      walletlink: { url: 'https://mainnet.eth.aragon.network/' },
      wanmask: { rpcUrl: 'http://192.168.1.2:8545/'},
    }}
  >
    <App />
    <style>
      {`
        body {
          width: 40rem;
          margin: 0 auto;
          font-family: sans-serif;
          font-size: 18px;
          line-height: 1.5;
        }
        button {
          width: 6rem;
        }
        h1 {
          font-weight: 400;
        }
        p {
          display: grid;
          justify-content: space-between;
          align-items: center;
          grid-auto-flow: column;
          gap: 1rem;
          align-items: center;
          margin: 2rem 0;
        }
        button {
          height: 3rem;
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
        }
        .connect-label {
          margin-bottom: 1rem;
        }
        .connect-buttons {
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }
        .connect-buttons button {
          width: 100%;
          height: 4rem;
        }
      `}
    </style>
  </UseWalletProvider>,
  document.querySelector('#app')
)
