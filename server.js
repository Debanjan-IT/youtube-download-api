'use strict';

const Hapi = require('@hapi/hapi');
const Joi = require('joi');
require("dotenv/config")

const puppeteer = require("puppeteer");

const init = async () => {

  const server = Hapi.server({
    port: process.env.PORT || 3007,
    host: 'localhost'
  });
  server.route({
    method: 'GET',
    path: '/',
    handler: async (request, h) => {
      return `
        <h1>Youtube Downloader</h1>
      `
    }
  });

  server.route({
    method: 'GET',
    path: '/get-video-links',
    options: {
      validate: {
        query: Joi.object({
          video_url: Joi.string().required()
        })
      }
    },
    handler: async (request, h) => {
      try {
        const websiteUrl = 'https://www.y2mate.com/en373'
        const url = request.query.video_url;
        const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox","--disable-notifications"] });
        const page = await browser.newPage();
        await page.goto(websiteUrl);
        await page.focus('#txt-url')
        await page.keyboard.type(url)
        await page.click("#btn-submit")
        await page.waitForSelector('#result > div > div.col-xs-12.col-sm-5.col-md-5 > div.thumbnail.cover > a > img')
        let thumbnail = (await page.$('#result > div > div.col-xs-12.col-sm-5.col-md-5 > div.thumbnail.cover > a > img'))
        thumbnail = await page.evaluate(el => el.src, thumbnail)
        await page.waitForSelector("#result")
        await page.waitForSelector("#result > div > div.col-xs-12.col-sm-5.col-md-5 > div.thumbnail.cover > div > b")
        let title = (await page.$('#result > div > div.col-xs-12.col-sm-5.col-md-5 > div.thumbnail.cover > div > b'))
        title = await page.evaluate(el => el.innerText, title)
        await page.waitForSelector('#mp4 > table > tbody > tr')
        const numberRows = (await page.$$('#mp4 > table > tbody > tr')).length
        let data = []
        for (let index = 1; index <= numberRows; index++) {
            await page.waitForSelector(`#mp4 > table > tbody > tr:nth-child(${index}) > td:nth-child(1) > a`)
            let element1 = await page.$(`#mp4 > table > tbody > tr:nth-child(${index}) > td:nth-child(1) > a`)
            await page.waitForSelector('#mp4 > table > tbody > tr')
            await page.waitForSelector(`#mp4 > table > tbody > tr:nth-child(${index}) > td:nth-child(2)`)
            let element2 = await page.$(`#mp4 > table > tbody > tr:nth-child(${index}) > td:nth-child(2)`)
            await page.waitForSelector('#mp4 > table > tbody > tr')
            const page1 = await browser.newPage();
            await page1.goto(websiteUrl);
            await page1.focus('#txt-url')
            await page1.keyboard.type(url)
            await page1.click("#btn-submit")
            await page1.waitForSelector(`#mp4 > table > tbody > tr:nth-child(${index}) > td.txt-center > a`)
            await page1.click(`#mp4 > table > tbody > tr:nth-child(${index}) > td.txt-center > a`)
            await page1.waitForSelector("#process-result > div > a")
            let link = await page1.$("#process-result > div > a")
            let returnVal = {
                format: await page.evaluate(el => el.textContent, element1),
                size: await page.evaluate(el => el.textContent, element2),
                link: await page1.evaluate(el => el.href, link)
            }
            data.push(returnVal)
        }
        await browser.close()
        return {title, thumbnail, data}
      } catch (error) {
        console.log(error);
      }
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();