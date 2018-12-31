// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'
import '../styles/index.css'

// Import libraries we need.
import {
  default as Web3
} from 'web3'
import {
  default as contract
} from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import smartMarketArtifact from '../../build/contracts/SmartMarket.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
const smartMarket = contract(smartMarketArtifact)

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let account

let counts

const App = {
  start: function () {
    const self = this

    // Bootstrap the MetaCoin abstraction for Use.
    smartMarket.setProvider(web3.currentProvider)

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs
      account = accounts[0]

      self.refreshBalance()
      self.refreshGoods()
      self.refreshOrder()
    })
  },

  setStatus: function (message) {
    const status = document.getElementById('status')
    status.innerHTML = message
  },

  refreshBalance: function () {
    const self = this

    let meta
    smartMarket.deployed().then(function (instance) {
      meta = instance
      return meta.getBalance.call({
        from: account
      })
    }).then(function (value) {
      const balanceElement = document.getElementById('balance')
      balanceElement.innerHTML = value[1]
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })
  },

  refreshGoods: function () {
    const self = this

    let meta
    smartMarket.deployed().then(function (instance) {
      meta = instance
      return meta.getgoodcount.call({
        from: account
      })
    }).then(function (value) {
      const countElement = document.getElementById('gcount')
      countElement.innerHTML = value.valueOf()
      const goods = document.getElementById('clist')
      goods.innerHTML = '<option value="">请选择</option>'
      layui.use('form', function () {
        var form = layui.form
        form.render('select')
      })
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting good count; see log.')
    })

    smartMarket.deployed().then(function (instance) {
      meta = instance
      return meta.queryall.call({
        from: account
      })
    }).then(function (value) {
      const goods = document.getElementById('slist')
      goods.innerHTML = '<option value="">请选择</option>'
      var i = 0
      value.forEach(element => {
        if (element !== '') {
          goods.options.add(new Option(element, i++))
        }
      })
      counts = i
      const cgoods = document.getElementById('clist')
      cgoods.innerHTML = '<option value="">请选择</option>'
      i = 0
      value.forEach(element => {
        if (element !== '') {
          cgoods.options.add(new Option(element, i++))
        }
      })
      layui.use('form', function () {
        var form = layui.form
        form.render('select')
      })
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting good count; see log.')
    })
  },

  createSale: function () {
    const self = this

    const name = document.getElementById('sgoodname').value
    const value = parseInt(document.getElementById('sgoodprice').value)
    const key = document.getElementById('sgoodkey').value
    const sender = document.getElementById('saddress').value
    const value2 = value * 2

    this.setStatus('Initiating transaction... (please wait)')

    let meta
    smartMarket.deployed().then(function (instance) {
      meta = instance
      return meta.createsale(name, value, value2, key, {
        from: sender,
        value: value2 + 1,
        gas: 1000000
      })
    }).then(function () {
      self.setStatus('Transaction complete!')
      self.refreshBalance()
      self.refreshGoods()
      self.refreshOrder()
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error sending coin; see log.')
    })
  },

  querysale: function (value) {
    var state = new Array()
    state[0] = '出售中'
    state[1] = '已锁定'
    state[2] = '待取货'
    state[3] = '已出售'
    const slist = document.getElementById('slist')
    // const sender = document.getElementById('saddress').value
    const id = value // slist.value

    this.setStatus('Start to call query... (please wait)')

    let meta
    smartMarket.deployed().then(function (instance) {
      meta = instance
      return meta.querygoodbyid(id, {
        from: account
      })
    }).then(function (value) {
      const card = document.getElementById('goodinfo')
      const body = card.lastElementChild
      body.children[0].innerHTML = 'Id: ' + value[0]
      body.children[2].innerHTML = 'Name: ' + value[1]
      body.children[4].innerHTML = 'Price: ' + value[2]
      body.children[6].innerHTML = 'State: ' + state[value[3]]
      body.children[8].innerHTML = 'Key: ' + value[4]
      const card2 = document.getElementById('cgoodinfo')
      const body2 = card2.lastElementChild
      body2.children[0].innerHTML = 'Id: ' + value[0]
      body2.children[2].innerHTML = 'Name: ' + value[1]
      body2.children[4].innerHTML = 'Price: ' + value[2]
      body2.children[6].innerHTML = 'State: ' + state[value[3]]
      body2.children[8].innerHTML = 'Key: ' + value[4]
      layui.use('element', function () {
        var element = layui.element
        element.render('card')
      })
    })
  },

  buy: function () {
    const self = this

    const clist = document.getElementById('clist')
    const id = clist.value
    const cvalue = parseInt(document.getElementById('cvalue').value)
    const sender = document.getElementById('caddress').value

    this.setStatus('Start to call query... (please wait)')

    let meta
    smartMarket.deployed().then(function (instance) {
      meta = instance
      return meta.buyitnowprice(id, {
        from: sender,
        value: cvalue,
        gas: 1000000
      })
    }).then(function (value) {
      const string1 = value[0]
      const bool1 = value[1]
      console.log(string1)
      console.log(bool1)
      window.alert('购买成功！')
      self.refreshBalance()
      self.refreshGoods()
      self.refreshOrder()
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error buy; see log.')
    })
  },

  refreshOrder: function () {
    const self = this
    let meta
    smartMarket.deployed().then(function (instance) {
      meta = instance
      return meta.queryall.call({
        from: account
      })
    }).then(function (value) {
      const list = document.getElementById('order-list')
      list.innerHTML = ''
      var i = 0
      value.forEach(element => {
        if (element != '') {
          smartMarket.deployed().then(function (instance) {
            meta = instance
            return meta.querygoodbyid(i++, {
              from: account
            })
          }).then(function (value) {
            const state = value[3]
            if (state != 0) {
              list.innerHTML += value[1]
            }
          })
        }
      })
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting good count; see log.')
    })
  },
  pickup: function () {
    const clist = document.getElementById('clist')
    const sender = document.getElementById('caddress').value
    const id = clist.value
    let meta
    smartMarket.deployed().then(function (instance) {
      meta = instance
      return meta.extraction.call(id, {
        from: sender
      })
    }).then(function (value) {
      window.alert('key:' + value)
    })
  },
  comfirm: function () {
    for (var i = 0; i < counts; i++) {
      const id = i
      let meta
      smartMarket.deployed().then(function (instance) {
        meta = instance
        return meta.sellerconfirm(id, {
          from: account,
          value: 1,
          gas: 100000
        })
      }).then(function (value) {
        self.refreshBalance()
        self.refreshGoods()
        self.refreshOrder()
      })
    }
  }

}

window.App = App

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
      ' ensure you\'ve configured that source properly.' +
      ' If using MetaMask, see the following link.' +
      ' Feel free to delete this warning. :)' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:8545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
  }

  App.start()
})