const fs = require('fs')
const TronWeb = require('tronweb')
const abi = require('./transferAbi.js')
// 每个用户要接受的金额
const AMOUNT = 1000000

const fullNode = 'https://api.trongrid.io';
const solidityNode = 'https://api.trongrid.io';
const eventServer = 'https://api.trongrid.io/';
let userList = []

const tronWeb = new TronWeb(
  fullNode,
  solidityNode,
  eventServer
);

const tron = tronWeb.contract(abi, '417b88c7ccae7465563e027a38c7b7bbb472d25ae6')

// 往出转账的公钥
tronWeb.setAddress('TVNpcWSwj4jHCuGVJausyyGLBnhEVNwGki')
// 往出转账的私钥
tronWeb.setPrivateKey('adc67dc1c0b771dbecf93f366bc82c76ac486ea89cf6942de5a154368ef55f69')





fs.readFile('account.json', 'utf8', (err, data) => {
  if (err) {
    console.log('读取用户私钥失败');
  } else {
    userList = JSON.parse(data).rows
    console.log('用户账户已获取完毕,现在开始进行转账操作');
    transaction(AMOUNT)
  }
})


function transaction (callValue) {
  const promises = [...Array(userList.length)].map((item, index) => {
    try {
      return tron.transferTrx(userList[index].address, callValue).send({
        shouldPollResponse: false,
        callValue: callValue
      })
    } catch (err) {
      console.log(err, 'err')
      alert('contract data error')
    }
  })
  try {
    Promise.all(promises).then(resp => {
      console.log(resp, '转账成功');
    })
  } catch (err) {
    console.log(err, 'err')
    alert('contract data error')
  }
}



