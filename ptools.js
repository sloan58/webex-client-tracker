require('dotenv').config()
const fs = require('fs')
const path = require('path')
const request = require('request')
const cheerio = require('cheerio')
const puppeteer = require('puppeteer')
const htmlparser2 = require('htmlparser2')

const mySite = process.env.WEBEX_SITE

const fetchWebexSite = async () => {
  const url = `https://${mySite}.webex.com/webappng/sites/${mySite}/dashboard/download`
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setRequestInterception(true)
  page.on('request', request => {
    request.continue()
  })
  await page.goto(url, { waitUntil: 'load' })

  const html = await page.content()
  browser.close()

  const dom = htmlparser2.parseDOM(html)
  const $ = cheerio.load(dom)
  const pToolsCurrentVersion = $(
    '.versionContent > table > tr:last-child > td:last-child'
  ).text()

  return pToolsCurrentVersion
}

function downloadFile(clientVersion) {
  let downloadUrl = `https://akamaicdn.webex.com/upgradeserver/client/ptool/${clientVersion}/msi/webexplugin.msi`

  request(downloadUrl)
    .on('error', err => {
      console.log(err)
    })
    .pipe(
      fs.createWriteStream(
        path.join(__dirname, `webexplugin_${clientVersion}.msi`)
      )
    )
}

fetchWebexSite().then(version => {
  let urlVersion = version
    .split('.')
    .slice(0, version.split('.').length - 1)
    .join('.')
  downloadFile(urlVersion)
})
