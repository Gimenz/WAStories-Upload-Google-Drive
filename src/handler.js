let { WAConnection, ReconnectMode, MessageType, STORIES_JID, WAMessageProto } = require('@adiwajshing/baileys');
const drive = require('../lib/drive')
const fs = require('fs');
const { color, bgColor } = require('../utils');
const client = new WAConnection();

async function run() {
    client.autoReconnect = ReconnectMode.onConnectionLost
    client.connectOptions.maxRetries = 10
    client.logger.level = 'silent'
    client.on('qr', qr => console.log('Scan This QR Code'));

    fs.existsSync('./session.json') && client.loadAuthInfo('./session.json');
    client.on('connecting', () => {
        console.log('connecting');
    })
    client.on('open', () => {
        const authInfo = client.base64EncodedAuthInfo()
        fs.writeFileSync('./session.json', JSON.stringify(authInfo, null, '\t'))
        console.log('authenticated');
    })
    client.connect({ timeoutMs: 30 * 1000 })

    client.on('chat-update', async (msg) => {
        try {
            if (!msg.hasNewMessage) return;
            let m = msg.messages.all()[0];
            let type = Object.keys(m.message)[0];
            let chatType = bgColor(color(type, 'black') + ' Status', 'yellow')
            if (m.key.remoteJid == STORIES_JID && !m.key.fromMe) {
                let t = m.messageTimestamp;
                let sender = m.key.participant
                let contactName = client.contacts[sender].name || client.contacts[sender].notify
                waktu = moment(t * 1000).format('HH.mm.ss')
                tanggal = moment(t * 1000).format('DD.MM.YYYY')
                if (type == MessageType.extendedText || type == MessageType.image || type == MessageType.video) {
                    // declare list for save filepath name
                    global.list = []
                    // text caption
                    let caption = m.message[type].caption

                    /** DIRECTORY MANAGER */
                    // parentFolderName [user folder name]
                    let parentFolderName = `${sender.split('@')[0]}_${contactName.replace(/\W+?/g, '_')}`
                    // child folder name is a story posted date
                    let childFolderName = `${tanggal}_${sender.split('@')[0]}`
                    // path media, if a user not in temp folder before
                    let pathMedia = `./tmp/${parentFolderName}`
                    // create path media foler if a user not in temp folder before
                    if (!fs.existsSync(pathMedia)) { fs.mkdirSync(pathMedia) }
                    // filename to save in local dir
                    let filename = `${pathMedia}/${waktu}`
                    // path to caption, this used to save caption file 
                    let captionPath = `${filename}_caption.txt`

                    console.log(color('[STORY]', 'yellow'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), caption, color(`~> ${chatType} from`,), color(contactName, 'magenta'))
                    // if stories has a caption, save file and add to list[]
                    if (caption) {
                        fs.writeFileSync(captionPath, caption, 'utf-8')
                        global.list[parentFolderName] = [
                            [captionPath]
                        ]
                    }

                    // save file if type is text stories
                    if (type == MessageType.extendedText) {
                        let { font, text, textArgb, } = m.message.extendedTextMessage
                        font = WAMessageProto.ExtendedTextMessage.ExtendedTextMessageFontType[font]
                        let caption = `${text}\n${'-'.repeat(25)}\nBackground: #${textArgb.toString(16)}\nFont: ${font}`
                        let textPath = `${filename}_textStories.txt`
                        fs.writeFileSync(textPath, caption, 'utf-8')
                        global.list[parentFolderName] = [
                            [textPath]
                        ]
                    }

                    // save file if type is media message
                    if (type !== MessageType.extendedText) {
                        // download mediaMessage and save to local dir 
                        let downloaded = await client.downloadAndSaveMediaMessage(m, filename);
                        // if media not in list[], add to list. or if caption not in list[]
                        global.list[parentFolderName] == undefined
                            ? global.list[parentFolderName] = [
                                filelist = [downloaded]
                            ]
                            : global.list[parentFolderName][0].push(downloaded)
                    }

                    // check parent folder (parent folder is contact name)
                    let checkParentFolder = await drive.checkFolderExists(parentFolderName);
                    let parentFolderId;
                    if (!checkParentFolder.exists) {
                        let create = await drive.createFolder(parentFolderName)
                        parentFolderId = create.id
                    } else {
                        parentFolderId = checkParentFolder.id
                    }

                    // check child folder (child folder is date while stories is posted)
                    let checkChildFolder = await drive.checkFolderExists(childFolderName);
                    let childFolderId;
                    if (!checkChildFolder.exists) {
                        let create = await drive.createFolder(childFolderName, parentFolderId)
                        childFolderId = create.id
                    } else {
                        childFolderId = checkChildFolder.id
                    }

                    // add google drive childFolderId to list[]
                    global.list[parentFolderName].push(childFolderId)

                    // upload to google drive from file list[]
                    global.list[parentFolderName][0].map(async (v) => {
                        await drive.uploadFile(v, list[parentFolderName][1]).then(() => {
                            try {
                                fs.unlinkSync(v)
                            } catch (error) {
                                console.log(error);
                            }
                        })
                    })

                    // delete list[] if the file has ben uploaded to google drive
                    delete list[parentFolderName]
                }

            }
        } catch (error) {
            console.log(error);
        }
    })
}

run().catch(e => console.log(e))