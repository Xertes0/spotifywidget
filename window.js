const { ipcRenderer } = require("electron")

var token = ""
var ref_token = ""

async function getTokens(code, client_id, client_secret){
    const response = await window.fetch("https://accounts.spotify.com/api/token",{
        method: "POST",
        headers: {
            //"Authorization":"Basic " + clientId + ":" + clientSecret,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=authorization_code&client_id="+client_id+"&client_secret="+client_secret+"&code="+code+"&redirect_uri=https%3A%2F%2Fexample.com"
    })

    console.log(response)
    return response.json()
}

async function upToken(){
    const response = await window.fetch("https://accounts.spotify.com/api/token",{
        method: "POST",
        headers: {
            //"Authorization":"Basic " + clientId + ":" + clientSecret,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=refresh_token&refresh_token="+ref_token
    })

    console.log(response)
    return response.json()
}

async function getTrack(){
    const response = await window.fetch("https://api.spotify.com/v1/me/player/currently-playing",{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        }
    })

    console.log(response)
    if(response.status == 204)
        return "Not today"
    return response.json()
}

function update(){
    getTrack().then(data => {
        console.log(data)
        if(data === "Not today"){
            return
        }

        const name = data["item"]["name"]
        artists = ""
        for(i = 0; i<data["item"]["artists"].length; i++){
            artists += data["item"]["artists"][i]["name"] + ", "
        }

        const album = data["item"]["album"]["name"]
        const photo = data["item"]["album"]["images"][0]["url"]

        console.log(name)
        console.log(artists)
        console.log(album)
        console.log(photo)

        document.getElementById("title").innerHTML = name
        document.getElementById("artists").innerHTML = artists
        document.getElementById("photo").src = photo
    })
}

ipcRenderer.on("loaded", (event, code, client_id, client_secret) =>{
    console.log("ipcRenderer")
    console.log(code)
    console.log(client_id)
    console.log(client_secret)

    getTokens(code, client_id, client_secret).then(data =>{
        console.log(data)

        token = data["access_token"]
        ref_token = data["refresh_token"]

        setInterval(upToken, (parseInt(data["expires_in"]) * 1000) - 5000) // expires_in time in SECONDS    also subtract 5000 ms for latency recompensation
        setInterval(update, 5000)
    })
})