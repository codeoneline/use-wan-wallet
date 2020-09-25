const chainId = 1
const connectorsInitsOrConfigs = {
  walletconnect: {rpcUrl: 'https://mainnet.eth.aragon.network/' },
  w2: { rpcUrl: 'https://mainnet.eth.aragon.network/' },
  w3: { rpcUrl: 'https://mainnet.eth.aragon.network/' },
  injected: {
    web3ReactConnector({ chainId }) {
      return ;
    },
    handleActivationError(err) {
      return;
    },
  },
}  

const connectors = {
    wanmask: {
      web3ReactConnector({ chainId }) {
        console.log(`chainId = ${chainId}`)
      },
      handleActivationError(err) {
        console.log(`err = ${err}`)
      },
    },
  
    injected: {
      web3ReactConnector({ chainId }) {
        console.log(`chainId = ${chainId}`)
      },
      handleActivationError(err) {
        console.log(`err = ${err}`)
      },
    },
    walletconnect: {
      web3ReactConnector({ chainId }) {
        console.log(`chainId = ${chainId}`)
      },
      handleActivationError(err) {
        console.log(`err = ${err}`)
      },
    },
  }

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
  for (const [id, config] of configs) {
    if (connectors[id]) {
      connectors[id].config = config
    }
  }
  
  console.log(JSON.stringify([inits, configs], null, 2))
  console.log(JSON.stringify(connectors, null, 2))