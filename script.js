const date = new Date()
let showDays = JSON.parse(localStorage.getItem('showDays')) || false
const savingProgress = JSON.parse(localStorage.getItem('savingProgress'))
let savings = savingProgress?.savings || 0
let daysOfSaving = savingProgress?.daysOfSaving || 0
let checkedDays = savingProgress?.checkedDays || []

const calendar = (() => {
	const months = []

	for (let month = 1; month <= 12; month++) {
		let currentMonth = []
		let currentDate = new Date(date.getFullYear(), month, 0).getDate()

		for (let day = 1; day <= currentDate; day++) {
			currentMonth.push(day)
		}

		months.push(currentMonth)
	}

	return months
})()

const todayEl = document.querySelector('#today')
const savingsEl = document.querySelector('#savings')
const daysOfSavingEl = document.querySelector('#daysOfSaving')

todayEl.innerHTML = `${date.toDateString()}`
savingsEl.innerHTML = `Ksh ${savings}`
daysOfSavingEl.innerHTML = `${daysOfSaving} days of saving`

console.log(calendar)
calendar.forEach((month, index) => {
	const calendarEl = document.querySelector('#calendar')
	const monthTitleEl = document.createElement('p')
	const monthEl = document.createElement('article')
	const days = month

	const formatter = new Intl.DateTimeFormat('en-US', {month: 'long'});
	monthTitleEl.innerHTML = formatter.format(date.setMonth(index))
	monthTitleEl.classList.add('py-4', 'px-8', 'text-xl', 'text-center', 'font-semibold')

	monthEl.appendChild(monthTitleEl)
	monthEl.appendChild(createWeekdays())
	monthEl.appendChild(createDays(days))

	calendarEl.appendChild(monthEl)
})

function createWeekdays() {
	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat']
	const weekDaysEl = document.createElement('div')
	weekDaysEl.classList.add('py-4', 'grid', 'grid-cols-7', 'gap-4')

	weekDays.forEach(day => {
		const weekDayEl = document.createElement('div')
		weekDayEl.innerHTML = day
		weekDayEl.classList.add('text-center', 'font-semibold', 'text-slate-500')
		weekDaysEl.appendChild(weekDayEl)
	})

	return weekDaysEl
}

function createDays(days) {
	const daysEl = document.createElement('div')
	daysEl.classList.add('grid', 'grid-cols-7', 'gap-4')

	// Set the first day of the month and the last day of the previous month
	date.setDate(1)
	const firstDayIndex = date.getDay()
	const lastDayIndex = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDay()
	const prevMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate()

	// Insert padding days before days of the month
	for (let i = firstDayIndex; i > 0; i--) {
		const dayEl = document.createElement('div')
		dayEl.innerHTML = `${prevMonthLastDay - i + 1}`
		dayEl.classList.add('padding-days', 'mx-auto', 'grid', 'place-items-center', 'h-10', 'w-10', 'text-slate-400', 'rounded-full')
		daysEl.appendChild(dayEl)
	}

	// Insert days of the month
	days.forEach(day => {
		const isToday = day === new Date().getDate() && date.getMonth() === new Date().getMonth()
		const today = new Date(date.getFullYear(), date.getMonth(), day)
		const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

		// Create day container/label
		const dayEl = document.createElement('label')
		dayEl.setAttribute('for', `day${dayOfYear}`)
		dayEl.innerHTML = `<span class="date block">${day}</span>`
		dayEl.innerHTML += `<span class="day hidden">${dayOfYear}</span>`
		dayEl.classList.add('mx-auto', 'grid', 'place-items-center', 'h-10', 'w-10', 'rounded-full', 'hover:bg-orange-200', 'transition', 'cursor-pointer')

		// Create checkbox input
		const dayInput = document.createElement('input')
		dayInput.setAttribute('type', 'checkbox')
		dayInput.setAttribute('id', `day${dayOfYear}`)
		dayInput.setAttribute('value', `${dayOfYear}`)
		dayInput.classList.add('hidden')
		dayEl.appendChild(dayInput)

		// Highlight the current date
		if (isToday) {
			dayEl.classList.add('bg-purple-500', 'text-white', 'hover:bg-purple-500')
			dayEl.classList.replace('hover:bg-orange-200', 'hover:bg-purple-500')
			daysEl.appendChild(dayEl)
		} else {
			daysEl.appendChild(dayEl)
		}

		dayInput.onchange = e => {
			if (e.target.checked) {
				if (!checkedDays.includes(dayOfYear)) {
					savings += parseInt(e.target.value)
					daysOfSaving++
					checkedDays.push(dayOfYear)
					saveProgress({savings, daysOfSaving, checkedDays})
				}

				e.target.parentElement.classList.add('text-white')

				// If the current date is checked change the color
				if (isToday) {
					dayEl.classList.replace('bg-purple-500', 'bg-gradient-to-br')
					dayEl.classList.add('from-orange-500', 'via-purple-500', 'to-orange-500')
				} else {
					dayEl.classList.remove('from-orange-500', 'to-purple-500')
					dayEl.classList.remove('bg-gradient-to-br')
					dayEl.classList.add('bg-orange-500')
				}
			} else {
				savings -= parseInt(e.target.value)
				daysOfSaving--
				checkedDays.splice(checkedDays.indexOf(dayOfYear), 1)
				saveProgress({savings, daysOfSaving, checkedDays})

				// If the current date is unchecked change the color
				if (isToday) {
					dayEl.classList.replace('bg-gradient-to-br', 'bg-purple-500')
					dayEl.classList.remove('from-orange-500', 'via-purple-500', 'to-orange-500')
				} else {
					e.target.parentElement.classList.remove('bg-orange-500', 'text-white')
				}
			}

			savingsEl.innerHTML = `Ksh ${savings}`
			daysOfSavingEl.innerHTML = `${daysOfSaving} days of saving`
		}
	})

	// Insert padding days before days of the month
	for (let i = 1; i <= 7 - lastDayIndex - 1; i++) {
		const dayEl = document.createElement('div')
		dayEl.innerHTML = `${i}`
		dayEl.classList.add('padding-days', 'mx-auto', 'grid', 'place-items-center', 'h-10', 'w-10', 'text-slate-400', 'rounded-full')
		daysEl.appendChild(dayEl)
	}

	return daysEl
}

// Switch between using dates or days
function changeMode(e) {
	localStorage.setItem('showDays', e.target.checked)

	if (e.target.checked) {
		e.target.parentElement.classList.replace('bg-orange-100', 'bg-orange-500')
		e.target.parentElement.classList.add('text-white')
		e.target.nextElementSibling.classList.replace('bg-orange-500', 'bg-white')
		e.target.nextElementSibling.classList.add('translate-x-6')

		document.querySelectorAll('.padding-days').forEach(el => {
			el.classList.add('opacity-0')
		})
		document.querySelectorAll('.day').forEach(el => {
			el.classList.replace('hidden', 'block')
		})
		document.querySelectorAll('.date').forEach(el => {
			el.classList.replace('block', 'hidden')
		})
	} else {
		e.target.parentElement.classList.replace('bg-orange-500', 'bg-orange-100')
		e.target.parentElement.classList.remove('text-white')
		e.target.nextElementSibling.classList.replace('bg-white', 'bg-orange-500')
		e.target.nextElementSibling.classList.remove('translate-x-6')

		document.querySelectorAll('.padding-days').forEach(el => {
			el.classList.remove('opacity-0')
		})
		document.querySelectorAll('.day').forEach(el => {
			el.classList.replace('block', 'hidden')
		})
		document.querySelectorAll('.date').forEach(el => {
			el.classList.replace('hidden', 'block')
		})
	}
}

(() => {
	const showDaysEl = document.querySelector('#showDays')
	if (!showDays) return
	showDaysEl.click()
})()

checkedDays.forEach(day => {
	const dayEl = document.querySelector(`#day${day}`)
	if (dayEl.checked) return
	dayEl.click()
})

function saveProgress(data) {
	localStorage.setItem('savingProgress', JSON.stringify(data))
}
