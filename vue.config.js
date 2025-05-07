// module相当于当前的js

/*
这段配置表示：当前端请求的路径以 /api 开头时，开发服务器会将这些请求转发到 http://127.0.0.1:8000/，并且会自动去掉路径中的 /api 前缀。
因此，前端代码中只需要使用相对路径 /api/file/image，开发服务器会自动将其转换为 http://127.0.0.1:8000/file/image。
*/
module.exports = {
    // 配置代理信息。前端请求时url带该前缀时走代理请求到target指定的后端服务器上，并且请求路径中的该前缀被去掉，还原成后端接口原来的路径。
    devServer:{
        proxy:{
            '/api':{
                target:'http://127.0.0.1:8001/',
                pathRewrite:{
                    '^/api':''
                },
                changeOrigin: true,
                logLevel: 'debug'
            }
        }
    }
}