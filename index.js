require('dotenv').config();
const axios = require('axios');
const { promisify } = require('util');
// This gives us a promise when a stream is finished piping, for playSound
const stream = require('stream');
const finished = promisify(stream.finished);
const cheerio = require('cheerio');
const fs = require('fs');
const Speaker = require('speaker');

const MOUNTPOINT_STRING = process.env.MOUNTPOINT;
const TIME_BETWEEN_REQUESTS = 2000;
const ICECAST_ADMIN_PASSWORD = process.env.ICECAST_PASSWORD
const ICECAST_SERVER_URL = process.env.ICECAST_URL
let numberOfListeners = 0

const main = () => {
    // Check .env validity
    if (!process.env.ICECAST_PASSWORD || !process.env.ICECAST_URL || !MOUNTPOINT_STRING) {
        console.log('your .env file is missing some data, please check!');
        playSound('error');
        return;
    }

    process.nextTick(monitorListeners)
}

const playSound = async (filename) => {
    const speaker = new Speaker({
        channels: 2,          // 2 channels
        bitDepth: 16,         // 16-bit samples
        sampleRate: 44100     // 44,100 Hz sample rate
    });
    const fileStream = fs.createReadStream(`sounds/${filename}.wav`)
    fileStream.pipe(speaker);
    return finished(fileStream);
}


const monitorListeners = async () => {
    try {
        const icecastPageResponse = await axios({
            method: 'get',
            url: `${ICECAST_SERVER_URL}/admin/stats?mount=${MOUNTPOINT_STRING}`,
            auth: {
                username: 'admin',
                password: ICECAST_ADMIN_PASSWORD
            }
        });

        if (icecastPageResponse.status !== 200) {
            console.log('icecast response error!');
            playSound('error');
            return;
        }

        const xmlResponse = icecastPageResponse.data;
        const $ = cheerio.load(xmlResponse, { xmlMode: true });
        const mountpointListeners = Number($(`source`).find('listeners').text());

        // Monitor
        if (mountpointListeners > numberOfListeners) {
            console.log(`We have more listeners! ${mountpointListeners}`)
            playSound('join');
        }
        else if (mountpointListeners < numberOfListeners) {
            console.log(`Less listeners... Oh no! ${mountpointListeners}`)
            playSound('leave');
        }
        numberOfListeners = mountpointListeners;

        // Create a timeout to continue running this script indefinitely
        setTimeout(monitorListeners, TIME_BETWEEN_REQUESTS)
    } catch (error) {
        playSound('error');
        console.error(`Error getting listener count! ${error}`)
    }
}
main();
