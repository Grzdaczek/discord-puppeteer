require('dotenv').config()
const fs = require('fs');
const puppeteer = require('puppeteer')

const enterCommand = async (page, command) => {
	await page.waitForSelector('div[role=textbox]')
	await page.click('div[role=textbox]')
	await page.keyboard.type(command)
	await page.keyboard.press('Enter')
}

const exec = async () => {
	const browser = await puppeteer.launch({ headless: process.env.NODE == 'DEBUG' ? false : true })
	const page = await browser.newPage()
	await page.goto(`https://discord.com/channels/${process.env.SERVER}/${process.env.CHANNEL}`)

	await page.setViewport({
		width: 1200,
		height: 800,
	})

	await page.waitForSelector('input[name=email]')
	await page.focus('input[name=email]')
	await page.keyboard.type(process.env.EMAIL)

	await page.waitForSelector('input[name=password]')
	await page.focus('input[name=password]')
	await page.keyboard.type(process.env.PASSWORD)

	await page.click('button[type=submit]')

	await enterCommand(page, '$p')
	
	await new Promise(r => setTimeout(r, 1000));

	browser.close()
}

const main = async () => {
	let now = new Date()

	try {
		await exec();
		fs.appendFile('scraper.log', `${now.toString()}\tinfo: executed successfully\n`, () => {})
	}
	catch (err) {
		fs.appendFile('scraper.log', `${now.toString()}\terror: ${err.message}\n`, () => {})
	}

	now = new Date()

	const minutesToWait = (60 - now.getMinutes()) + 10 + Math.floor(Math.random()*40)
	console.log(`minutes to wait: ${minutesToWait}`)
	setTimeout(main, minutesToWait * 60 * 1000)
}

main()