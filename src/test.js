const fs = require('fs')

let sender = '628523@.c.us';
let contactName = 'ngnau mbah'
let filePath = `./tmp/${sender.split('@')[0]}_${contactName.replace(/\s+?/g, '_')}`