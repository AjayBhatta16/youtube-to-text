var puppeteer = require('puppeteer')
var readline = require('readline')
var fs = require('fs')

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

var date = new Date()

async function scrape(url) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    let songQuery
    console.log("Opening youtube...")
    await page.goto(url)
    await page.setDefaultNavigationTimeout(0)
    await page.setDefaultTimeout(0)
    await page.waitForSelector('#meta')
    console.log("Extracting playlist metadata...")
    let songs = await page.evaluate(() => {
        let results = []
        let songTitle, songArtist
        let elements = document.querySelectorAll('#meta')
        elements.forEach(el => {
            songTitle = el.querySelector('h4')
            songArtist = el.querySelector('#byline')
            if (songTitle) {
                results.push({
                    title: songTitle.textContent,
                    artist: songArtist.textContent
                })
            }
        })
        return results;
    })
    console.log("Sorting metadata...")
    songs.forEach(song => {
        song.title = song.title.trim()
        song.artist = song.artist.trim()
    })
    await browser.close()
    console.table(songs)
    console.log("Saving playlist data to text file...")
    var fileName = `youtube-to-text-${date.getMonth()}${date.getDate()}${date.getFullYear()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}.txt`
    fs.writeFile(fileName,'Title:         Artist: \n', err => {
        if (err) throw err
    })
    songs.forEach(song => {
        fs.appendFile(fileName,`${song.title}         ${song.artist} \n`, err => {
            if (err) throw err
        })
    })
    return songs
}


rl.setPrompt('Enter the URL for your playlist: ')
rl.prompt()
rl.on('line', (answer) => {
    scrape(answer)
    rl.close()
})
