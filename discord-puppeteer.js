require('dotenv').config()
const fs = require('fs')
const puppeteer = require('puppeteer')
const schedule = require('node-schedule')

const execCommand = async (command) => {
	const browser = await puppeteer.launch({ headless: process.env.NODE == 'PRODUCTION' ? true : false })
	const page = await browser.newPage()
	await page.goto(`https://discord.com/channels/${process.env.SERVER}/${process.env.CHANNEL}`)

	// await page.setViewport({
	// 	width: 1200,
	// 	height: 800,
	// })

	await page.waitForSelector('input[name=email]')
	await page.focus('input[name=email]')
	await page.keyboard.type(process.env.EMAIL)

	await page.waitForSelector('input[name=password]')
	await page.focus('input[name=password]')
	await page.keyboard.type(process.env.PASSWORD)

	await page.click('button[type=submit]')

	await page.waitForSelector('div[role=textbox]')

	await page.click('div[role=textbox]')
	await page.keyboard.type(command)
	if(process.env.NODE == 'PRODUCTION') await page.keyboard.press('Enter')
	await new Promise(r => setTimeout(r, 1000));

	browser.close()
}

const log = (message, category = 'info') => {
	fs.appendFile('scraper.log', `${new Date().toString()}\t${category}:\t${message}\n`, () => {})
}

schedule.scheduleJob('* * 0,8,10,12,14,16,18,20,22 * * *', () => {
	do {
		const timeoutMinutes = Math.floor(Math.random() * 115);
		const job = () => execCommand('$p').then(() => log(`Executed command`)).catch(() => log(err, 'error'))
		setTimeout(job, timeoutMinutes * 60 * 1000)
		log(`Scheduled job with offset: ${timeoutMinutes}m`)
	} while(Math.random() < 0.1);
})