const express = require('express')
const { queryValidator } = require('./validator/queryValidator')
require('dotenv/config')
var cors = require('cors')
const puppeteer = require("puppeteer");
const app = express()
const port = 3000
app.use(cors())

app.get('/api/get-link', async (req, res) => {
    try {
        const result = await queryValidator.validateAsync(req.query)
        const websiteUrl = `https://www.y2mate.com/youtube/${result.video_url.split('=')[1]}`
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                "--disable-notifications",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--single-process",
                "--no-zygote",
            ],
        });
        const page = await browser.newPage();
        await page.goto(websiteUrl, {
            waitUntil: 'networkidle2'
        });
        await page.waitForSelector("#result > div > div.col-xs-12.col-sm-5.col-md-5 > div.thumbnail.cover > div > b")
        let title = (await page.$('#result > div > div.col-xs-12.col-sm-5.col-md-5 > div.thumbnail.cover > div > b'))
        title = title ? await page.evaluate(el => el.innerText, title) : ''
        await page.waitForSelector(`#mp4 > table > tbody > tr:nth-child(1) > td:nth-child(1) > a`)
        let element1 = await page.$(`#mp4 > table > tbody > tr:nth-child(1) > td:nth-child(1) > a`)
        await page.waitForSelector('#mp4 > table > tbody > tr')
        await page.waitForSelector(`#mp4 > table > tbody > tr:nth-child(1) > td:nth-child(2)`)
        let element2 = await page.$(`#mp4 > table > tbody > tr:nth-child(1) > td:nth-child(2)`)
        await page.waitForSelector('#mp4 > table > tbody > tr')
        const page1 = await browser.newPage();
        await page1.goto(websiteUrl, {
            waitUntil: 'networkidle2'
        });
        await page1.waitForSelector(`#mp4 > table > tbody > tr:nth-child(1) > td.txt-center > a`)
        await page1.click(`#mp4 > table > tbody > tr:nth-child(1) > td.txt-center > a`)
        await page1.waitForSelector("#process-result > div > a")
        let link = await page1.$("#process-result > div > a")
        let returnVal = {
            format: await page.evaluate(el => el.textContent, element1),
            size: await page.evaluate(el => el.textContent, element2),
            link: await page1.evaluate(el => el.href, link)
        }
        await browser.close()
        res.send({ title, returnVal })
    } catch (error) {
        console.log(error);
    }
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})