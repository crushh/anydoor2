const { cache } = require('../config/defaultConfig')
function refreshRes(stats, res) {
    const { maxAge, expires,cacheControl,lastModified,etag} = cache
    if (expires){
        res.setHeader('Expires', (new Date(Date.now() + maxAge* 1000).toUTCString()))
    }
    if (cacheControl) {
        res.setHeader('Cache-Control', `public,max-age=${maxAge}`)
    }
    if (lastModified) {
        res.setHeader('Last-Modified', stats.mtime.toUTCString())
    }
    if (etag) {
        res.setHeader('ETag', `${stats.size} - ${stats.mtime}`)
    }
}
module.exports = function isFresh (stats, req, res) {
    refreshRes(stats, res)
    const lastModified = req.headers['if-modified-since']
    const etag = req.headers['if-none-match']
    if (!lastModified && !etag) { // 第一次请求
        return false
    }
    if (lastModified && lastModified!== res.getHeader('Last-Modified')) { // if-modified-since则与被请求资源的最后修改时间进行对比（Last-Modified）,若最后修改时间较新（大），说明资源又被改过，则返回最新资源，HTTP 200 OK;若最后修改时间较旧（小），说明资源无新修改，响应HTTP 304 走缓存
        return false
    }
    if (etag && etag!== res.getHeader('ETag')) { // Etag是属于HTTP 1.1属性，它是由服务器（Apache或者其他工具）生成返回给前端，用来帮助服务器控制Web端的缓存验证。
        return false
    }
    return true
}