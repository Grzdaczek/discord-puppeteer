require('dotenv').config()
const fs = require('fs')
const puppeteer = require('puppeteer')
const schedule = require('node-schedule')

const log = (message, fn = 'log') => {
	const text = `${new Date().toUTCString()}\t${fn}:\t${message}`
	if(typeof console[fn] == 'function') console[fn](text)
	fs.appendFile('puppeteer.log', text + '\n', () => {})
}

const PRODUCTION = process.env.NODE == 'PRODUCTION' ? true : false
if(!PRODUCTION) log('Running in development mode', 'warn')

const message = async (msg, server, channel) => {
	const browser = await puppeteer.launch({ headless: PRODUCTION})

	log('Browser: launch', 'log');

	const page = await browser.newPage()
	await page.goto(`https://discord.com/channels/${server}/${channel}`)

	await page.waitForSelector('input[name=email]')
	await page.focus('input[name=email]')
	await page.keyboard.type(process.env.EMAIL)

	await page.waitForSelector('input[name=password]')
	await page.focus('input[name=password]')
	await page.keyboard.type(process.env.PASSWORD)

	await page.click('button[type=submit]')

	log('Browser: page login', 'log');

	await page.waitForSelector('div[role=textbox]')

	await page.click('div[role=textbox]')
	await page.keyboard.type(msg)
	if(PRODUCTION) await page.keyboard.press('Enter')
	await new Promise(r => setTimeout(r, 1000));

	log('Browser: command send', 'log');
	browser.close()
}

schedule.scheduleJob('0 0 0,8,10,12,14,16,18,20,22 * * *', () => {
	do {
		const timeoutMinutes = Math.floor(Math.random() * 115);
		const job = () => message('$p', process.env.SERVER, process.env.CHANNEL)
			.then(() => log(`Scheduler: job executed: message $p`))
			.catch((err) => log(err, 'error'))
		setTimeout(job, timeoutMinutes * 00 * 1000)
		log(`Scheduler: job created, offset: ${timeoutMinutes}m`)
	} while(Math.random() < 0.1);
})
