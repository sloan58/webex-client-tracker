require('dotenv').config()

const fs = require('fs')
const path = require('path')
const request = require('request')

// Look for Webex Versions that are at least v33
const regex = new RegExp(".*(WBXclient\-33.*)\.txt.*")

// Get the Webex site name from .env
const mySite = process.env.WEBEX_SITE

// Define the Webex Site data URL
const webexUrl = `https://${mySite}.webex.com/version/wbxversionlist.do?siteurl=${mySite}`

// Send request to get Webex Site data
request(webexUrl, (error, response, body) => {
    if (error) {
        console.log('error:', error)
    }

    // Extract the Client Version from the HTML response
    let clientVersion = body.match(regex)[1]

    // Define the OS client versions and paths we're interested in
    let osVersions = [
        {
            path: '',
            extension: 'msi'
        }, {
            path: 'mac/intel',
            extension: 'dmg'
        }
    ]

    // Loop each client version to download locally
    osVersions.forEach(osVersion => {
        downloadFile(osVersion, clientVersion)
    })
})

// Download the Webex Client version from the Webex CDN
function downloadFile(osVersion, clientVersion) {

    // Define the download URL
    let downloadUrl = `https://akamaicdn.webex.com/client/${clientVersion}/${osVersion.path}/webexapp.${osVersion.extension}`

    // Send request to download file and pipe to local file system
    request(downloadUrl).on('error', (err) => {
        console.log(err)
    }).pipe(fs.createWriteStream(path.join(__dirname, `${clientVersion}.${osVersion.extension}`)))
}