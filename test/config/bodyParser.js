const path = require('path')
module.exports = {
    multipart: true,
    maxFieldsSize: 1024 * 1024 * 1024,
    jsonLimit: '50mb',
    formidable: {
        keepExtensions: true,
        uploadDir: path.resolve(process.cwd(), 'upload'),
        onFileBegin: async function (name, file) {
            const day = moment().format('YYYYMMDD');
            const ext = file.name.substr(file.name.lastIndexOf('.') + 1).toLocaleLowerCase();
            const fPath = path.dirname(file.path) + path.sep + day;
            const fileName = path.basename(file.path);
            let tu = fPath + path.sep + fileName;
            let th = tu;
            const fileType = require('../lib/mime')(file);
            if (['VIDEO', 'AUDIO'].includes(fileType)) {
                checkAndMkdir(`${fPath}/thumbNails`, `${fPath}/mp4s`, `${fPath}/times`, `${fPath}/images`);
                tu = `${fPath}/images/${fileName}`;
                th = `${fPath}/thumbNails/${fileName}`;
                file.DuartionFilePath = `${fPath}/times/${fileName}`;
            } else checkAndMkdir(fPath);
            file.OriginFileName = file.name;
            file.EncodedFileName = fileName;
            file.FileUrl = tu.replace(path.resolve(path.sep + 'mnt' + path.sep + `sdb`), '')
            file.ThumbnailUrl = th.replace(path.resolve(path.sep + 'mnt' + path.sep + `sdb`), '')
            file.ExtensionName = ext;
            file.FileType = fileType;
            file.path = tu;
        }
    },
}