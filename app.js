const express = require('express')
const { queryValidator } = require('./validator/queryValidator')
require('dotenv/config')
var cors = require('cors')
const puppeteer = require("puppeteer");
const app = express()
const port =  process.env.PORT || 3000
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
                "--no-zygote"
            ],
        });
        console.log(websiteUrl);
        const page = await browser.newPage();
        await page.goto(websiteUrl, {
            waitUntil: 'networkidle2'
        });
        console.log("gone to website");
        await page.waitForSelector(`#mp4`)
        console.log(1);
        await page.click(`#mp4 > table > tbody > tr:nth-child(1) > td.txt-center > a`)
        console.log(2);
        await page.waitForSelector("#process-result > div > a")
        console.log(3);
        let link = await page.$("#process-result > div > a")
        console.log(4);
        let returnVal = {
            link: await page.evaluate(el => el.href, link)
        }
        console.log("data fetched");
        await browser.close()
        res.send(returnVal)
    } catch (error) {
        console.log(error);
    }
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})