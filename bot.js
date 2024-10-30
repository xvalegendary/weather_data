import { Telegraf } from 'telegraf'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
const apiKey = process.env.WEATHER_API_KEY
let userLanguage = 'ru' 

bot.start(ctx => {
	ctx.reply(
		'Добро пожаловать! Пожалуйста, введите название города для получения погоды. Используйте /setlanguage для выбора языка.'
	)
})


bot.command('setlanguage', ctx => {
	ctx.reply('Выберите язык: /ru для русского, /en для английского.')
})


bot.command('ru', ctx => {
	userLanguage = 'ru'
	ctx.reply('Язык установлен на русский.')
})

bot.command('en', ctx => {
	userLanguage = 'en'
	ctx.reply('Language set to English.')
})

bot.on('text', async ctx => {
	const city = ctx.message.text

	try {
		const response = await fetch(
			`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`
		)
		if (!response.ok) {
			if (response.status === 404) {
				throw new Error('Город не найден.')
			}
			throw new Error('Ошибка при получении данных.')
		}
		const data = await response.json()

		const date = new Date(data.location.localtime)
		const thisDate = date.toLocaleDateString(
			userLanguage === 'ru' ? 'ru-RU' : 'en-US',
			{ weekday: 'long', day: 'numeric', month: 'long' }
		)

		const weatherMessage =
			userLanguage === 'ru'
				? `${data.current.last_updated}\nПогода в ${data.location.name}:\nТемпература: ${data.current.temp_c}°C\nСостояние: ${data.current.condition.text}\nСкорость ветра: ${data.current.wind_kph} км/ч\nМинимальная температура: ${data.current.mintemp_c}°C\nМаксимальная температура: ${data.current.maxtemp_c}°C`
				: `${data.current.last_updated}\nWeather in ${data.location.name}:\nTemperature: ${data.current.temp_c}°C\nCondition: ${data.current.condition.text}\nWind Speed: ${data.current.wind_kph} km/h\nMin Temperature: ${data.current.mintemp_c}°C\nMax Temperature: ${data.current.maxtemp_c}°C`

		ctx.reply(weatherMessage)
	} catch (error) {
		console.error(error)
		ctx.reply(
			userLanguage === 'ru'
				? 'Произошла ошибка. Проверьте название города и попробуйте снова.'
				: 'An error occurred. Please check the city name and try again.'
		)
	}
})

bot.launch()
console.log('Бот запущен')
