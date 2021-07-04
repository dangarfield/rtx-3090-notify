const fetch = require('node-fetch')
// const puppeteer = require('puppeteer')
const Push = require('pushover-notifications')
require('dotenv').config()

const init = async () => {
//   const browser = await puppeteer.launch(options)
//   const page = await browser.newPage()
  const currysData = await getCurrysData()
  let found = false
  while (!found) {
    const foundCurrys = await scrapeCurrys(currysData)
    if (foundCurrys.length > 0) {
      await sendCurrysNotification(foundCurrys)
      found = true
      await sleep(60 * 60 * 1000)
    }
    await sleep(60 * 1000)
  }
  //   await browser.close()
  console.log('closing')
}
const sendCurrysNotification = async (found) => {
  var p = new Push({
    user: process.env.PUSHOVER_USER,
    token: process.env.PUSHOVER_TOKEN
  })

  var msg = {
    message: found.map(i => `${i.title} - ${i.quantityAvailable} available - ${i.price} - ${i.url}`).join('\n'),
    title: 'Currys RTX Stock!!!',
    sound: 'magic',
    device: 'Dan10',
    priority: 1
  }

  console.log('Send message', msg.message)
  p.send(msg, function (err, result) {
    if (err) {
      throw err
    }
    console.log(result)
  })
}
const sleep = async (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
const getCurrysData = async () => {
  const url = 'https://api.currys.co.uk/smartphone/api/products/10214420,10219689,10219345,10214447,10214422,10214424,10214427,10219330,10214428,10222459,10214912,10214887,10216243,10218698,10218688,10220875,10220494,10225778,10220562,10220358,10222745,10219570'
  const response = await fetch(url)
  return response.json()
}
const scrapeCurrys = async (currysData) => {
  const url = 'https://api.currys.co.uk/smartphone/api/productsStock/10214420,10219689,10219345,10214447,10214422,10214424,10214427,10219330,10214428,10222459,10214912,10214887,10216243,10218698,10218688,10220875,10220494,10225778,10220562,10220358,10222745,10219570'
  const response = await fetch(url)
  const data = await response.json()
  //   console.log(data)
  data.payload = data.payload.filter(i => i.quantityAvailable > 0)
  data.payload = data.payload.map(i => {
    const p = currysData.payload.find(p => p.id === i.productId)
    i.title = p.label
    i.url = p.links['currys.co.uk']
    i.price = '£ ' + Math.ceil(p.price.amount / 100)
    return i
  })
  if (data.payload.length > 0) {
    console.log(data)
  }
  console.log(`Found ${data.payload.length} - ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}`)
  return data.payload
}
// const scrapeScan = async (page) => {
//   const url = 'https://www.scan.co.uk/shop/computer-hardware/gpu-nvidia-gaming/nvidia-geforce-rtx-3090-graphics-cards#filter=1&inStock=1'
//   await page.goto(url)
//   await page.screenshot({path: 's/s.png'})
//   const productCount = await page.$$('.products .product')
// }
init()
