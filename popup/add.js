
async function addHandler() {
    console.log('addHandler')

    const tabs = await browser.tabs.query({ currentWindow: true, active: true })
    const tab = tabs[0]

    if (!tab.url) {
        console.error('Url not found')
        location.href = 'error.html'
    }

    const listid = document.getElementById('listsel').value

    if (!listid) {
        console.error('Invalid task list')
        location.href = 'error.html'
    }

    const title = document.getElementById('titlein').value || tab.title

    console.log(`Creating task for ${tab.url} in ${listid} with title: ${title}`)
    browser.storage.local.set({ lastlistsel: listid })

    insertTask(listid, title, tab.url)
        .then(() => location.href = 'done.html')
        .catch(() => location.href = 'error.html')

}




getTaskLists()
    .then(async (lists) => {
        const lastlistsel = (await browser.storage.local.get('lastlistsel')).lastlistsel
        const select = document.getElementById('listsel')
        for (const l of lists) {
            const opt = document.createElement('option')
            opt.setAttribute('value', l.id)
            if (l.id === lastlistsel) {
                opt.setAttribute('selected', 'true')
            }
            opt.appendChild(document.createTextNode(l.title))
            select.appendChild(opt)
        }
    }).catch(e => {
        console.error('get task list failed')
        location.href = 'error.html'
    })

browser.tabs.query({ currentWindow: true, active: true })
    .then((tabs) => {
        const tab = tabs[0]
        document.getElementById('titlein').value = tab.title
    })

document.getElementById('addbtn').addEventListener('click', addHandler)