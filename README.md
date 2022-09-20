Webp Batch Convert
========
webp 图片批量转换。将指定目录内 png/jpg/jpeg/bmp/gif 格式的图片批量转换为 webp 格式。

> 该工具是基于[lzwme/webp-batch-convert](https://github.com/lzwme/webp-batch-convert)二次开发, 添加一些配置项,以及细节优化。
```mk
### 新增配置
1. replace_suffix: true, 开启替换webp后缀，默认保留源文件后缀。
2. gif: true 过滤gif图片, 直接将gif图片copy到新文件夹，保留动效。

### 优化
1. 当文件超出一定数量 递归执行会造成内存溢出 需要优化 递归调用方式
“事件驱动” （Event-Driven）的特性
在 JavaScript 中，由于其 “事件驱动” （Event-Driven）的特性，使用 "setTimeout"、 “nextTick” 等方式对指定函数的调用，实际上是将该函数的引用（指针）储存起来，并在适当的时候调用。[参考](https://github.com/pfan123/Articles/issues/50)。
2. 空文件过滤，file.size 为零判空。
3. 目标嵌套目录可深度工作。
```
## 快速上手

### 在项目目录中安装

```bash
npm install --save-dev webp-batch-convert-p
```

### 使用示例(nodejs 模块 API 方式)

```js
//import convert from 'webp-batch-convert-p';
const convert = require('webp-batch-convert-p');
let res;

// 示例一: 生成 img 目录下的图片文件至 webp 目录
res = convert.cwebp('./img', './webp');
console.log('total: ', res);

// 示例二: 生成 img 目录下的图片文件至 webp 目录，附带质量等参数
// 更多参数参考：https://developers.google.com/speed/webp/docs/cwebp?csw=1#options
// 也可以执行如下命令通过 cwebp 帮助信息了解： `yarn cwebp --longhelp`
const cwebpOpts = {
    /** don't print anything */
    quiet: true,
    /** quality factor (0:small..100:big), default=75 */
    q: 75,
    /** transparency-compression quality (0..100), default=100 */
    alpha_q: 100,
    /** spatial noise shaping (0:off, 100:max), default=50 */
    sns: 50,
    /** filter strength (0=off..100), default=60 */
    f: 60,
    /** use simple filter instead of strong */
    nostrong: false,
    /** 是否替换图片后缀 */
    replace_suffix: true
};
// 清空输出目录
convert.utils.delDir('./webp');
res = convert.cwebp('./img','./webp', cwebpOpts);
console.log('total: ', res);
```

### `best-practice`

- [https://github.com/Jeffrey-mu/webp-batch-convert-p/tree/master/best-practice](https://github.com/Jeffrey-mu/webp-batch-convert-p/tree/master/best-practice)

## 命令行方式使用(cwebp-batch)

### 全局安装

```js
npm install -g webp-batch-convert-p
```

### 使用示例

```js
cwebp-batch --in img-folder --out webp-folder <-q 75 -quiet>
```
或者局部安装，然后如下方式使用：
```js
./node_modules/.bin/cwebp-batch --in img-folder --out webp-folder <-q 75 -quiet>
```
<p align="center">
    <img src="https://cdn.rawgit.com/lzwme/webp-batch-convert/master/test/img/snapshot.png">
</p>

## API

- `.cwebp(imgDir, webpDir, cwebpOptions)`

批量转换生成 webp。示例：
```js
// 将 img 目录下的所有图片转换为 webp 文件，输出至 webp 目录
const res = convert.cwebp('./img','./webp', {
    quiet: true, // 不输出详情
    q: 60        // 质量
});
console.log('total: ' + res);
```

- `.utils.mkDir(dirPath)`

创建一个(深度的)目录。示例：
```js
// 创建目录
convert.utils.mkDir('./src/assets/webp');
```

- `.utils.delDir(dirPath, ext)`

清空一个（非空的）目录。示例：
```js
// 删除 webp 目录
convert.utils.delDir('./webp');
// 删除 webp 目录下的所有 webp 后缀的文件
convert.utils.delDir('./webp', 'webp');
// 删除 webp 目录下的所有 .webp 后缀的文件
convert.utils.delDir('./webp', /\.webp$/);
```

## 二次开发

- 依赖安装 `yarn install`
- 修改/新增功能
- 添加测试并执行 `yarn test`
- `cwebp-batch` 命令行命令全局安装与测试 `npm i -g ./`

## License

`webp-batch-convert-p` is released under the MIT license.


