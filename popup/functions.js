
const REDIRECT_URL = browser.identity.getRedirectURL();
const CLIENT_ID = "446792787610-70gjrpv0889qkvr39a0uqmv7tamllt13.apps.googleusercontent.com";
const SCOPES = ["https://www.googleapis.com/auth/tasks", "https://www.googleapis.com/auth/tasks.readonly"];

const AUTH_URL =
    `https://accounts.google.com/o/oauth2/auth\
?client_id=${CLIENT_ID}\
&response_type=token\
&redirect_uri=${encodeURIComponent(REDIRECT_URL)}\
&scope=${encodeURIComponent(SCOPES.join(' '))}`;


async function getNewToken() {
    console.log('Asking for a new token')

    const res = await browser.identity.launchWebAuthFlow({
        interactive: true,
        url: AUTH_URL
    });

    console.log(res)
    const match_token = /access_token=(.*)&token_type/.exec(res)
    const match_exp = /expires_in=(\d+)&scope/.exec(res)

    if (match_token && match_exp) {
        const token = match_token[1]
        //console.log(token)

        const expires_in = parseInt(match_exp[1])
        //console.log(expires_in)

        browser.storage.local.set({ 'authtoken': { token: token, exp: Date.now() + expires_in * 1000 } })
        return token
    }

    throw new Error('Login failed')
}


async function getAuthToken() {
    const token = await browser.storage.local.get('authtoken')
        .then(async (r) => {
            //console.log(r)
            if (!r.authtoken || r.authtoken.exp < Date.now() - 60000 * 5) {
                return await getNewToken()
            }
            //console.log(r.authtoken.token)
            return r.authtoken.token
        })
    //console.log(token)
    return token
}


async function getTaskLists() {
    let token = await getAuthToken()

    let r = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists',
        { headers: { Authorization: 'Bearer ' + token } })

    if (r.status !== 200) {
        // try to refresh the token
        token = await getNewToken()
        r = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists',
            { headers: { Authorization: 'Bearer ' + token } })
    }

    const j = await r.json()

    const lists = j.items

    //console.log(lists.map(l => l.title))

    return lists
}

async function insertTask(listid, title, text) {
    const token = await getAuthToken()
    console.log('insert', token)
    const task = {
        title,
        notes: text,
    }

    const r = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listid}/tasks`,
        {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        })


    //console.log(r.status)

    if (r.status !== 200) {
        console.error('Insert failed')
        throw Error('Insert failed')
    }

    return
}

