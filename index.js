const electron = require("electron")
const {screen, app, BrowserWindow } = require("electron")
const fs = require("fs")

let data_path = "data.json"

console.log(process.argv)

if(app.commandLine.hasSwitch("data")){
    data_path = app.commandLine.getSwitchValue("data") // --data="path" NOT --data "path"
}

console.log(data_path)

const data = fs.readFileSync(data_path)
const json = JSON.parse(data)

const client_id = json["client_id"]
const client_secret = json["client_secret"]

if(client_secret == "Your client secret"){
    console.error("Put your client id and client secret (https://developer.spotify.com/dashboard) to the data.json file!")
}

function createWindow(){

    let authWindow = new BrowserWindow({
        width: 800, 
        height: 600, 
        show: false, 
        "node-integration": false,
        "web-security": false
    })

    const authUrl = "https://accounts.spotify.com/authorize?client_id=" + client_id + 
        "&response_type=code&redirect_uri=https%3A%2F%2Fexample.com&scope=user-read-currently-playing"

    console.log(authUrl)

    authWindow.loadURL(authUrl);
    authWindow.show();

    authWindow.webContents.on('will-redirect', function (event, newUrl) {
        if(!newUrl.startsWith("https://example.com")){
            return
        }

        console.log(newUrl);

        const winWidth = 550
        const winHeigh = 200

        let window
        if(app.commandLine.hasSwitch("dev")){
            window = new BrowserWindow({
                width: winWidth, 
                height: winHeigh, 
                //frame: false,
                //transparent: true,
                //type: "desktop",
                webPreferences:{
                    nodeIntegration: true
                }
            })
        }
        else{
            window = new BrowserWindow({
                width: winWidth, 
                height: winHeigh, 
                frame: false,
                transparent: true,
                type: "desktop",
                show: true,
                webPreferences:{
                    nodeIntegration: true,
                    devTools: false
                }
            })

            window.setIgnoreMouseEvents(true)
        }

        window.setPosition(screen.getPrimaryDisplay().size.width - winWidth, 0)
        window.loadFile("window.html")
        window.webContents.on("did-finish-load", () =>{
            window.webContents.send("loaded", newUrl.slice(26), client_id, client_secret)
        })
        window.on("closed", () =>{
            window = null
        })
        window.webContents.on("console-message", (event, level, msg, line, source_id) =>{
            console.log("Messege from "+source_id+" line "+line+" level "+level+":"+msg)
        })
        authWindow.close();
    })
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () =>{
    if(process.platform != "darwin"){
        app.quit()
    }
})

app.on("activate", () =>{
    if(BrowserWindow.getAllWindows.length === 0){
        createWindow()
    }
})