const fs = require('fs')
const path = require('path')
const TronWeb = require('tronweb')
const abi = require('./abi.js')
const fullNode = 'https://api.trongrid.io';
const solidityNode = 'https://api.trongrid.io';
const eventServer = 'https://api.trongrid.io/';

const tronWeb = new TronWeb(
  fullNode,
  solidityNode,
  eventServer
);
// 最大价格
const MAXPRICE = 30000000
// 最大调用次数
const NUMBER = 100



// 目前调用次数 
let number = 0
// 这一次调用buy用户的index
let userIndex = 0

const tron = tronWeb.contract(abi, '413d98cf7e5a5e5a8fe464732fe58cbb3f0428dfa0')

// 全部国家的消息
let totalCountry = []
// 用户信息
let userList = []
// 获取全部国家
function getTotalCountry () {
  setNextuser()
  const promises = [...Array(220)].map((item, index) => {
    try {
      return tron.allOf(index + 1).call()
    } catch (err) {
      console.log(err, 'err')
      alert('contract data error')
    }
  })
  try {
    Promise.all(promises).then(resp => {
      totalCountry = resp.map((item, index) => {
        item.price = parseInt(item._price._hex, 16)
        item.id = index + 1
        return item
      })
      console.log('所有国家信息已获取完毕');
      judgePrice()
    })
  } catch (err) {
    console.log(err, 'err')
    alert('contract data error')
  }
}
// 国家按照价格最低的排序
function sortCountryPrice () {
  totalCountry.sort((a, b) => +a.price - +b.price)
}
// 计算价格最低是否超过我们设置的最大值
function judgePrice () {
  sortCountryPrice()
  if (totalCountry[0].price > MAXPRICE) {
    console.log(`最便宜的国家价格是${totalCountry[0].price};;;比你设置的最大值${MAXPRICE}还大,是不是很尴尬`);
    return false
  }
  if (number > NUMBER) {
    console.log(`目前已执行${number}次;;;你设置的最大次数是${NUMBER}`);
    return false
  }
  buy()
}
// 购买
function buy () {
  tron.buy(totalCountry[0].id).send({
    shouldPollResponse: false,
    callValue: totalCountry[0].price
  }).then(resp => {
    console.log(`购买成功,这是你第${number}次购买,是有用户${userList[userIndex].address}以${totalCountry[0].price}价格购买,此次交易的哈希是${resp}`)
    // 调用次数增加
    number = number + 1
    // 切换到下一个用户
    if (userIndex + 1 === userList.length) {
      userIndex = 0
    } else {
      userIndex = userIndex + 1
    }
    calculationNextPrice()
  })
}
// 设置已购买过国家的下一次价格
function calculationNextPrice() {
  let price = totalCountry[0].price / 1000000
  if (price < 500) {
    totalCountry[0].price = Math.ceil(totalCountry[0].price * 135 / 95) + 200
  } else if (price < 2000) {
    totalCountry[0].price = Math.ceil(totalCountry[0].price * 125 / 97) + 200
  } else if (price < 5000) {
    totalCountry[0].price = Math.ceil(totalCountry[0].price * 117 / 97) + 200
  } else if (price >- 5000) {
    totalCountry[0].price = Math.ceil(totalCountry[0].price * 115 / 98) + 200
  }
  judgePrice()
}

// 设置下一个用户
function setNextuser () {
  tronWeb.setAddress(userList[userIndex].address)
  tronWeb.setPrivateKey(userList[userIndex].pk)
}


// 获取用户账号密码

fs.readFile('account.json', 'utf8', (err, data) => {
  if (err) {
    console.log('读取用户私钥失败');
  } else {
    userList = JSON.parse(data).rows
    console.log('用户账户已获取完毕...');
    getTotalCountry()
  }
})