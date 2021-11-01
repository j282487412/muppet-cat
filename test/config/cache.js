module.exports = {
    filter(content_type) { // 配置过滤的压缩文件的类型
        return true;
    },
    threshold: 2048, // 要压缩的最小响应字节
    flush: require('zlib').Z_SYNC_FLUSH, // 同步的刷新缓冲区数据；
};