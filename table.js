// Fetch data from dummy file or server
//Below code to get data from your server
// fetch('https://yourserver/api/data', { method: 'GET' })

let tableData
async function fetchData() {
	try {
		const response = await fetch('./dummy.json')
		const data = await response.json()
		tableData = data
		processData(tableData)
	} catch (error) {
		console.error('Error fetching data:', error)
	}
}

fetchData()

// Render table items
function processData(data) {
	const table = document.querySelector('.container')
	data.forEach((row, index) => {
		const div = document.createElement('div')
		div.className = 'row'
		div.setAttribute('data-label', `${index}`)
		div.innerHTML = `
				<div class="col col1">${row.column1}</div>
				<div class="col col2">${row.column2}</div>
				<div class="col col3">
						<input id="col-input" type="text" placeholder="Enter a text..." on/>			
				</div>
		`
		table.appendChild(div)
	})
}

// POST request to server (just change a direction on your server link)
async function sendPostRequest(data) {
	try {
		const response = await fetch('https://httpbin.org/post', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`)
		}

		const responseData = await response.json()
		console.log('Server response:', responseData)
	} catch (error) {
		console.error('Error:', error)
	}
}

const table = document.querySelector('.table')
const inputs = table.getElementsByTagName('input')

// On save button click
function saveButtonHandler() {
	var resultArray = []

	for (var i = 0; i < inputs.length; i++) {
		let inputValue = inputs[i].value.trim()
		if (inputValue !== '') {
			const col1 = inputs[i].parentNode.previousElementSibling
			const col2 = col1.previousElementSibling

			const resultObject = {
				col1: col1.innerHTML,
				col2: col2.innerHTML,
				col3: inputValue,
			}
			resultArray.push(resultObject)
		}
	}
	// console.log(resultArray)
	if (resultArray.length > 0) {
		sendPostRequest(resultArray)
		showSuccessPopup()
	} else {
		showFailedPopup()
	}
	console.log(resultArray)
}

// Pagination
const paginationNumbers = document.getElementById('pagination-numbers')
const paginatedList = document.getElementsByClassName('container')[0]
const listItems = paginatedList.getElementsByClassName('row')
const nextButton = document.getElementById('next-button')
const prevButton = document.getElementById('prev-button')

const paginationLimit = 10
let pageCount,
	currentPage = 1

const disableButton = button => {
	button.classList.add('disabled')
	button.setAttribute('disabled', true)
}

const enableButton = button => {
	button.classList.remove('disabled')
	button.removeAttribute('disabled')
}

const handlePageButtonsStatus = () => {
	if (currentPage === 1) {
		disableButton(prevButton)
	} else {
		enableButton(prevButton)
	}

	if (pageCount === currentPage) {
		disableButton(nextButton)
	} else {
		enableButton(nextButton)
	}
}

const handleActivePageNumber = () => {
	document.querySelectorAll('.pagination-number').forEach(button => {
		button.classList.remove('active')
		const pageIndex = Number(button.getAttribute('page-index'))
		if (pageIndex == currentPage) {
			button.classList.add('active')
		}
	})
}

const appendPageNumber = index => {
	const pageNumber = document.createElement('button')
	pageNumber.className = 'pagination-number'
	pageNumber.innerHTML = index
	pageNumber.setAttribute('page-index', index)
	pageNumber.setAttribute('aria-label', 'Page ' + index)

	paginationNumbers.appendChild(pageNumber)
}

const getPaginationNumbers = () => {
	for (let i = 1; i <= pageCount; i++) {
		appendPageNumber(i)
	}
}

const setCurrentPage = pageNum => {
	currentPage = pageNum

	handleActivePageNumber()
	handlePageButtonsStatus()

	const prevRange = (pageNum - 1) * paginationLimit
	const currRange = pageNum * paginationLimit

	Array.from(listItems).forEach((item, index) => {
		item.classList.add('hidden')
		if (index >= prevRange && index < currRange) {
			item.classList.remove('hidden')
		}
	})
}

window.addEventListener('load', () => {
	pageCount = Math.ceil(listItems.length / paginationLimit)
	getPaginationNumbers()
	setCurrentPage(1)

	prevButton.addEventListener('click', () => {
		setCurrentPage(currentPage - 1)
	})

	nextButton.addEventListener('click', () => {
		setCurrentPage(currentPage + 1)
	})

	document.querySelectorAll('.pagination-number').forEach(button => {
		const pageIndex = Number(button.getAttribute('page-index'))

		if (pageIndex) {
			button.addEventListener('click', () => {
				setCurrentPage(pageIndex)
			})
		}
	})
})

// Popup success and failed messages

function showSuccessPopup() {
	const successPopup = document.querySelector('.success')
	successPopup.style.display = 'flex'
	setTimeout(() => {
		successPopup.style.display = 'none'
	}, 1300)
}

function showFailedPopup() {
	const failedPopup = document.querySelector('.failed')
	failedPopup.style.display = 'flex'
	setTimeout(() => {
		failedPopup.style.display = 'none'
	}, 1300)
}

// Search
function searchHandler(e) {
	const numbers = paginationNumbers.querySelectorAll('button')
	if (e.target.value == '') {
		numbers.forEach(e => {
			e.classList.remove('disabled')
		})
		numbers[0].classList.add('active')
		nextButton.classList.remove('disabled')
		prevButton.classList.remove('disabled')
	} else {
		numbers.forEach(e => {
			e.classList.add('disabled')
			e.classList.remove('active')
		})
		nextButton.classList.add('disabled')
		prevButton.classList.add('disabled')
	}
	const tableClear = document.querySelector('.container')
	tableClear.innerHTML = ''
	const filteredList = tableData.filter(
		row =>
			row.column1.toLowerCase().includes(e.target.value.toLowerCase()) ||
			row.column2.toLowerCase().includes(e.target.value.toLowerCase())
	)
	// console.log(filteredList)
	processData(filteredList)
	// console.log(e.target.value)
}
