const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');

global.checkAndMkdir = (...paths) => {
    for (const path of paths) {
        if (!fs.existsSync(path)) {
            fse.mkdirsSync(path);
        }
    }
};

global.execAndGetDuration = async function (cmd, timePath) {
    await cmd.executeCmd();
    const dur = await getVideoDuration(timePath);
    return dur;
}

global.getVideoDuration = async function (absPath) {
    if (!absPath) {
        return false;
    }
    const flag = await existsFile(absPath);
    if (!flag) return '';
    try {
        const data = fs.readFileSync(absPath, 'utf8');
        const res = data.match(/Duration: (\d+:\d+:\d+.\d+),/);
        if (!res) {
            return '';
        }
        return res[1];
    } catch (e) { return ''; }
};

async function existsFile(path, times = 5, i = 0) {
    if (i > times) return false;
    if (fs.existsSync(path)) return true;
    else {
        await sleep(1000);
        return (await existsFile(path, times, ++i));
    }
}

global.sleep = async function (ms) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, ms);
    })
}

global.readFiles = function (abs, checkDir) {
    let list = [];
    if (abs.indexOf('*') != - 1) {
        const p = abs.split('*');
        const f = readFiles(p[0], false);
        if (p.length == 2) {
            for (let i = 0; i < f.length; i++) {
                const e = f[i];
                const l = readFiles(path.join(e, p[1]), true);
                list = list.concat(l);
            }
        }
    } else {
        if (fs.existsSync(abs)) {
            const p = fs.readdirSync(abs);
            p.forEach(e => {
                const s = path.join(abs, e)
                if (checkDir) {
                    if (!fs.statSync(s).isDirectory()) list.push(s);
                } else list.push(s);
            });
        }
    }
    return list;
}

// module.exports = { checkAndMkdir, execAndGetDuration, getVideoDuration, sleep }