module.exports = {
    root: process.cwd(), // 返回 Node.js 进程的当前工作目录。
    hostname: '127.0.0.1',
    port: 9527,
    compress: /\.(html|js|css|md)/,
    cache: {
        maxAge: 600,
        expires: true,
        cacheControl: true,
        lastModified: true,
        etag: true
    }

}