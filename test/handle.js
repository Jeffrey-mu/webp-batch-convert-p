const convert = require('../lib/cwebp');
// const convert = require('webp-batch-convert');
console.log(convert)
let res;
let startTime = +new Date();
console.log(new Date())
// 示例一: 生成 img 目录下的图片文件至 webp 目录
res = convert('./image', './web');
console.log((+new Date() - startTime) / 1000)
console.log(res);