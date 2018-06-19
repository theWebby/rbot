var r = require("robotjs");
var Jimp = require('jimp');
var path = require('path')
var tesseract = require('node-tesseract');

var count = 0;
var p = path.join(__dirname, '/../cm.png')
var isChopping = false;
var stopChoppingTimoutSet = false;
const PWORD = "James123"

// Clean escape on ctrl+c
process.on('SIGINT', function() {
    if (logoutOnEnd) {
        logout();
    }
    process.exit()
})

const TREE_COLORS = ['684925']

const MODES = ['FARM_TREES', 'COLOR_PICKER', 'FIND_TREE']
var mode = 0;
var isLoggedIn = false;
var logoutOnEnd = true;


var screenSize = r.getScreenSize()


async function main() {

    console.log(process.argv.length > 2)
    if (process.argv.length > 2) {
        BotController(process.argv.slice(2, process.argv.length - 1))
    } else {
        console.log(mode)
        bot()
    }
}


async function BotController(commands) {
    for (var i = 0; i < commands.length; i++) {
        switch (commands[i].toLowerCase()) {
            case "login":
                console.log('LOGIN')
            case "logout":
                console.log('LOGOUT')
            default:
                console.log('INVALID PROGRAM ARGUMENTS: ', commands[i])
        }
    }
}



async function bot() {
    if (!isLoggedIn) {
        await login()
    }

    console.log("MODE: ", MODES[mode])
    switch (mode) {
        case 0:
            console.log('calling farm trees')
            FarmTrees()
            return
        case 1:
            setInterval(() => {
                console.log(screenCap().colorAt(r.getMousePos().x, r.getMousePos().y))
            }, 5000);
            return
        case 2:
            console.log(findTree())
            return
        default:
            console.log("Invalid Mode")
    }
}






async function FarmTrees() {

    // while (inventoryFull(sc)) {
    // console.log('in while')
    while (true) {
        // console.log(isChopping)
        console.log('loop')
        if (!isChopping) {
            await findTree()
        } else {
            await awaitChopTree()
        }

        if (inventoryFull(screenCap())) {
            // console.log('lol')
            break;
        }

        console.log('finished')
    }
}



//Helpers

// Pick a random spot
// Take a capture of the top left of the screen
// Pass that image through ocr
// return true or false (tree or no tree)
async function findTree(sc) {
    return new Promise(resolve => {
        var random = { x: randomInt(0, screenSize.width), y: randomInt(0, screenSize.height) }
        console.log('\n\nFinding tree...', random)
        r.moveMouse(random.x, random.y);
        setTimeout(() => {

            // r.mouseClick('right')
            // r.moveMouse(random.x, random.y >= 10 ? random.y - 10 : 0) //to get a clearer screen cap
            var cmImage = contextMenuCap(random)

            // r.keyToggle('alt', 'down')
            // r.keyToggle('printscreen', 'down')
            // r.keyToggle('alt', 'up')
            // r.keyToggle('printscreen', 'up')

            try {
                var image = new Jimp(cmImage.width, cmImage.height, (err, img) => {
                    img.bitmap.data = cmImage.image;
                    img.getBuffer(Jimp.MIME_PNG, (err, png) => {
                        image.write('./cm' + '.png', () => {
                            // if (error) {
                            //     console.log(error);
                            //     return;
                            // }
                            console.log('Image Saved Successfully')


                            // Recognize text in the image
                            tesseract.process(p, (err, text) => {
                                if (err) {
                                    console.error(err);
                                } else {
                                    tree = isTree(text);
                                    if (tree) {
                                        r.mouseClick();
                                        isChopping = true;
                                    }
                                    resolve()

                                }

                            });
                        });
                    });
                });
            } catch (e) {
                console.error(e);
            }
        }, 1000);
    });

}


function isTree(text) {
    console.log('\n\nocr text: ', text)

    const TREE_TEXT = "chapdamokt";
    const NOT_TREE_TEXT = "ualk."
    const MIN_MATCH = 5;
    const MIN_NEG_MATCH = 2;
    text = text.toLowerCase();

    var positiveMatch = function() {
        if (count >= MIN_MATCH) {
            console.log('\n\n\nMATCH!')
            return true
        }
        return false
    }

    var nagativeMatch = function() {
        if (countN >= MIN_NEG_MATCH) {
            console.log('No Match')
            return true
        }
        return false
    }


    var count = 0;
    var countN = 0;
    for (var i = 0; i < text.length; i++) {
        if (TREE_TEXT.includes(text[i])) {
            count++
        }
        if (NOT_TREE_TEXT.includes(text[i])) {
            countN++
        }

        if (positiveMatch()) { return true }
        if (nagativeMatch()) { return false }
    }

    console.log('here:', positiveMatch())
    return positiveMatch()
}

function randomInt(min, max) {
    return Math.random() * (max - min) + min;
}

function hexColorDelta(hex1, hex2) {
    // get red/green/blue int values of hex1
    var r1 = parseInt(hex1.substring(0, 2), 16);
    var g1 = parseInt(hex1.substring(2, 4), 16);
    var b1 = parseInt(hex1.substring(4, 6), 16);
    // get red/green/blue int values of hex2
    var r2 = parseInt(hex2.substring(0, 2), 16);
    var g2 = parseInt(hex2.substring(2, 4), 16);
    var b2 = parseInt(hex2.substring(4, 6), 16);
    // calculate differences between reds, greens and blues
    var r = 255 - Math.abs(r1 - r2);
    var g = 255 - Math.abs(g1 - g2);
    var b = 255 - Math.abs(b1 - b2);
    // limit differences between 0 and 1
    r /= 255;
    g /= 255;
    b /= 255;
    // 0 means opposit colors, 1 means same colors
    return parseFloat((r + g + b) / 3);
}

function screenCap() {
    return r.screen.capture(0, 0, screenSize.width, screenSize.height)
}

function contextMenuCap(textLength) {
    var length = (typeof textLength === 'undefined') ? 120 : textLength * 9; //i did the sums, the math checks out
    var length = textLength * 9 || 120
    return r.screen.capture(0, 20, length, 35)
        // return r.screen.capture(0, 0, 150, 150)
}


// function bitmap2Image(bitmap) {
//     return "data:image/png;base64," + bitmap.image.toString('base64')
//         // return bitmap.dataURL()
// }

function inventoryFull(sc) {
    if (sc.colorAt(1860, 990) == "684925") {
        console.log('legit full')
        return true
    }

    console.log('not full')
    return false;
}

function loggedIn() {
    //checks for the red //click here to play now button
    var thisColor = screenCap().colorAt(980, 330);
    if (thisColor == "8b4537" || thisColor == "7f3222" || thisColor == "6e2015" || thisColor == "7b352b") {
        console.log("Logged In")
        return true;
    }
    return false;
}


// r.moveMouse(0, 0);
// r.mouseToggle("down");
// r.dragMouse(100, 100);
// r.mouseToggle("up");

function logout() {
    if (!logoutOnEnd) {
        return
    }
    console.log("Logging Out.")
    r.moveMouse(1800, 1035);
    r.mouseClick(); //incase contect menu is shown
    r.mouseClick();
    r.moveMouse(1800, 980);
    r.mouseClick();
}

async function login() {
    return new Promise(resolve => {
        console.log('Logging in...')
        r.moveMouse(1030, 320);
        r.mouseClick(); //click "existing user"
        setTimeout(() => {
            r.typeString(PWORD); //password

            setTimeout(() => {
                r.moveMouse(880, 350)
                r.mouseClick(); //click "login"
                while (!loggedIn() && !isLoggedIn) {} //wait to be logged in
                r.moveMouse(970, 350)
                r.mouseClick(); //click the "click here to play button"
                isLoggedIn = true;
                resolve()
            }, 200)
        }, 200)
    })

}

async function awaitChopTree() {
    return new Promise(resolve => {
        setTimeout(() => {
            isChopping = false;
            resolve();
        }, 15000)
    })
}




main().catch(e => { console.log(e) })