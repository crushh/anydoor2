const fs = require('fs')
const Handlebars = require('handlebars')
const promisify = require('util').promisify
const stat = promisify(fs.stat)
const path = require('path')
const readdir = promisify(fs.readdir)
// const config = require('../config/defaultConfig')
const mime = require('./mime')
const tplPath = path.join(__dirname, '../template/dir.tpl')
const source = fs.readFileSync(tplPath)
// const source = fs.readFileSync(tplPath, 'utf-8')
const template = Handlebars.compile(source.toString())
// 读buffer更快
const compress = require('./compress')
const isFresh = require('./cache')
module.exports = async function(req, res, filePath,config) {
    try {
        const stats = await stat(filePath)
       if(isFresh(stats, req, res)){
           res.statusCode = 304
           res.end()
           return
       }
        if (stats.isFile()){
            const contentType = mime(filePath)
            res.statusCode = 200
            res.setHeader('Content-Type',contentType)
            // fs.readFile(filePath, (err,data) => {
            //     res.end(data)
            // })// 异步 后端读取完才返回 慢
            let rs = fs.createReadStream(filePath) // 不慢
            if (filePath.match(config.compress)) {
                rs = compress(rs, req, res)
            }
            rs.pipe(res)
        } else if (stats.isDirectory()){
            const files =await readdir(filePath)
            const resuorce = path.relative(config.root, filePath)
            const data = {
                title: path.basename(filePath),
                dir: resuorce?`/${resuorce}`: '',
                files: files.map(file=>{
                    return {
                        icon: mime(file),
                        file
                    }
                })
            }
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html')
            res.end(template(data))
        }
    } catch(ex) {
        res.statusCode = 404
        res.setHeader('Content-Type','text/plain')
        res.end(`${filePath} is not a directoryeewew or file\n ${ex}`)
    }
}