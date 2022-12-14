// cwebp

const fs = require('fs');
const path = require('path');
const execFileSync = require('child_process').execFileSync;
const cwebp = require('cwebp-bin');
const utils = require('./utils');
const exec = require('child_process').exec;
// cwebp 额外的参数
let options = [];
const white_options = ['replace_suffix', 'gif', 'cover', 'del_old_dir']
// 是否为图片，后缀判断正则
const regIsImg = /\.(png|jpg|jpeg|bmp|gif)$/i;
const CWD = process.cwd();
let optionSrc, optionDst = null;
// 缓存已扫描过的目录
let handleredFolderList = [];

/**
 * 根据图片所在目录以及 webp 输出目录，获取所有的图片对应列表组
 * @param  {String} src 图片所在目录
 * @param  {String} dst webp 输出目录
 * @return {Array}
 */
function getFileList(src, dst) {
    let list = [];
    const rawSrc = src;
    const rawDst = dst;
    src = path.resolve(CWD, src);
    dst = path.resolve(CWD, dst);

    // 输入目录不存在或者已处理，返回空
    if (!fs.existsSync(src) || handleredFolderList.includes(src)) {
        return list;
    }

    handleredFolderList.push(src);

    // 输出目录是输入目录的子目录，则过滤它，防止造成死循环
    if (dst.includes(src) && dst !== src) {
        console.log('ok');
        handleredFolderList.push(dst);
    }

    // 输出目录不存在，创建它
    if (!fs.existsSync(dst)) {
        utils.mkDir(dst);
        handleredFolderList.push(dst);
    }

    // 读取目录中的所有文件/目录
    const paths = fs.readdirSync(src);

    paths.forEach((pathname) => {
        const _src = rawSrc + path.sep + pathname,
            _dst = rawDst + path.sep + pathname,
            st = fs.statSync(_src);

        // 为文件
        if (st.isFile() && st.size) {
            const type = [...new Set(regIsImg.exec([pathname]))]
            if (!regIsImg.test(pathname)) {
                list.push({
                    src: _src,
                    dst: options.includes('replace_suffix') ? _dst.replace(regIsImg, '.webp') : _dst,
                    type: 'copy',
                });
                return
            }
            // 如目标文件夹已有文件，则不需要转换
            try {
                fs.statSync(options.includes('replace_suffix') ? _dst.replace(regIsImg, '.webp') : _dst)
                if (options.includes('cover')) {
                    throw new Error('cover');
                }

            } catch (error) {
                list.push({
                    src: _src,
                    dst: options.includes('replace_suffix') ? _dst.replace(regIsImg, '.webp') : _dst,
                    type: type.length && type[0] === '.gif' && options.includes('gif') ? 'copy' : 'handle',
                });
            }

        } else if (st.isDirectory() && fs.readdirSync(_src).length) {

            // 是目录，创建输出路径对应的子目录
            if (!fs.existsSync(_dst) && !handleredFolderList.includes(path.resolve(CWD, _dst))) {
                fs.mkdirSync(_dst);
            }
            // 递归调用
            list = list.concat(getFileList(_src, _dst));
        }
    });

    return list;
}

/**
 * 获取额外的 webp 配置
 * @param  {Object} opts key 为配置项，value 为配置参数值
 * @return {Array}
 */
function getOptions(opts) {
    let o = [];
    // option white list
    // let optsList = ['q', 'sns', 'size', 'noalpha'];

    if (typeof opts !== 'object') {
        return o;
    }

    for (let opt in opts) {

        // 值为 false 忽略
        if (opts[opt] === false || opts[opt] === 'false') {
            continue;
        }
        if (!white_options.includes(opt)) {
            // 选项
            o.push('-' + opt);

            // 值不是 true，压入选项
            if (opts[opt] && opts[opt] !== true && opts[opt] !== 'true') {
                o.push(opts[opt]);
            }
        } else {
            o.push(opt);
        }

    }

    return o;
}

/**
 * 执行webp 处理（递归执行）
 * @param  {Array} list   getFileList 方法生成的输入与输出文件对应列表
 * @param  {Number} index 已处理的序列
 * @return {Number}       处理的图片数量
 */

function handlerCwebp(list, index = 0) {
    let count = index + 1;
    try {
        if (!list || !list.length || !list[0].src) {
            console.log('Do nothing.');
            return 0;
        }

        // 删除已存在的文件
        if (fs.existsSync(list[0].dst)) {
            fs.unlinkSync(list[0].dst);
        }
        // 根据type处理图片
        if (list[0].type === 'copy') {
            fs.writeFileSync(list[0].dst, fs.readFileSync(list[0].src), 'utf8');
        } else {
            execFileSync(cwebp, options.filter(el => el.startsWith('-') && el).concat([list[0].src, '-o', list[0].dst]));
        }

        console.log(`[${index + 1}] Image is converted! - ${list[0].src}`);



    } catch (e) {
        console.log(`[${index}] Error: ${e.message}`);
        fs.writeFileSync(list[0].dst, fs.readFileSync(list[0].src), 'utf8');
    } finally {
        if (list.length > 1) {
            setTimeout(() => {
                count = handlerCwebp(list.slice(1), count);
            }, 0)
        } else if (options.includes('del_old_dir') && fs.existsSync(path.resolve(CWD, optionDst))) {
            exec('rm -rf -- "' + path.resolve(CWD, optionSrc) + '"', function (error, stdout, stderr) {
                if (error) {
                    console.error('error: ' + error);
                    return;
                }
                fs.renameSync(path.resolve(CWD, optionDst), path.resolve(CWD, optionSrc))
                console.log('stderr: ' + typeof stderr)
            })

        }
    }

    return count;
}

/**
 * cwebp 执行
 * @param  {String} src  要转换的图片所在目录
 * @param  {String} dst  webp 输出目录
 * @param  {Object} opts cwebp 额外的参数，键值对对象
 * @return {Number}      处理的图片数量
 */
module.exports = function (src, dst, opts) {
    optionSrc = src;
    optionDst = dst;
    if (!src || !dst) return 0;
    src = path.normalize(src);
    dst = path.normalize(dst);
    // 输入目录与输出目录不相同，清空输出目录
    // if (src !== dst && fs.existsSync(dst)) utils.delDir(dst, /\.webp$/);
    options = getOptions(opts);

    const count = handlerCwebp(getFileList(src, dst));

    // 移除空目录
    // utils.delDir(dst, '.abcdefg');

    handleredFolderList = [];
    return count;
};
