import request from "request";
import cheerio from "cheerio";
import fs from "fs";
import https from "https";

const exitFileArr: Array<string> = [];
// 不能命名文件的字符
const fileReg = /[\\:*"<>|?]/g;

const createDir = (arr: Array<string>) => {
  let dir = "";
  for (const index in arr) {
    dir += "/" + arr[index];
    // 如果路径不存在，则创建
    if (!fs.existsSync(defaultPath + dir)) {
      fs.mkdirSync(defaultPath + dir);
    }
  }
};

let x = 0;
const webUrl = "https://www.ijjxs.com";
const defaultPath = `D:/Do it/web/downode.js/download`;
fs.mkdirSync(defaultPath);

// 写入本地文件流（图片）
const downloadPic = (url: string) => {
  const arr = url.split("/");
  console.log(url);
  arr.pop();
  arr.shift();
  // 删除不符合fileReg的字符
  url = url.replace(fileReg, "");
  // let dir = "";
  // for (const index in arr) {
  //   dir += "/" + arr[index];
  //   // 如果路径不存在，则创建
  //   if (!fs.existsSync(defaultPath + dir)) {
  //     fs.mkdirSync(defaultPath + dir);
  //   }
  // }
  createDir(arr);

  const req = https.request(webUrl + url, (res) => {
    res.pipe(fs.createWriteStream(defaultPath + url));
  });
  req.end();
};

// 创建文件的函数，如果文件夹不存在，先创建文件夹
const createFile = (
  // 文件的相对路径
  filePath: string,
  // 文件内容
  content: string,
  // 爬取的网站的url
  webUrl: string,
  // 设置的默认下载地址
  defaultPath: string,
  // 文件的后缀
  fileType: string
) => {
  // 如果不以'/'开头，则添加
  if (!/^\//.test(filePath)) filePath = "/" + filePath;
  // 删除不符合fileReg的字符
  filePath = filePath.replace(fileReg, "");
  const pathArr: Array<string | never> = filePath.split("/");

  if (!/\./g.test(pathArr[pathArr.length - 1])) {
    pathArr.push(`index.html`);
    // 新文件相对路径
    filePath = pathArr.join("/");
  }
  // 删除首项空字符串''
  pathArr.shift();

  if (pathArr.length === 1) return;
  // 如果是'/sss/aaa.xxx' => [ 'sss', 'aaa.xxx' ]，删尾项，如果是'/txt/wuxia' => '/txt/wuxia/index.html'
  pathArr.pop();
  createDir(pathArr);

  if (fileType === "html") spiderHtml(`${webUrl}${filePath}`);
};

//
const spiderHtml = (url: string) => {
  if (exitFileArr.includes(url.split(webUrl).join(""))) return;
  x++;
  console.log(x);
  // if (x > 500) return;
  request(url, (error, response, body) => {
    //res.statusCode 为200则表示链接成功
    if (error === null && response.statusCode === 200) {
      // console.log(`${url}链接成功`);
      //使用cheerio来解析body（网页内容），提取我们想要的信息
      const $ = cheerio.load(body);

      // // sript标签
      // $("script[src]")
      //   .toArray()
      //   .forEach((element) => {
      //     if (exitFileArr.includes(element.attribs.src)) return;
      //     // src的相对链接
      //     const scriptSrc = element.attribs.src;

      //     request(url + scriptSrc, (error, response, body) => {
      //       if (error === null && response.statusCode === 200) {
      //         console.log(`${url + scriptSrc}链接成功`);
      //         const $ = cheerio.load(body);

      //         // 调用createFile方法
      //         createFile(`${scriptSrc}`, $.text(), url, defaultPath, "js");
      //       }
      //     });

      //     element.attribs.src = `${defaultPath}${scriptSrc}`;
      //   });

      // // img标签
      // $("img[src]")
      //   .toArray()
      //   .forEach((element) => {
      //     downloadPic(element.attribs.src);
      //     element.attribs.src = `${defaultPath}${element.attribs.src}`;
      //   });

      // // link标签
      // $("link[href]")
      //   .toArray()
      //   .forEach((element) => {
      //     if (exitFileArr.includes(element.attribs.href)) return;

      //     const hrefUrl = element.attribs.href;

      //     request(url + hrefUrl, (error, response, body) => {
      //       if (error === null && response.statusCode === 200) {
      //         console.log(`${url + hrefUrl}链接成功`);
      //         const $ = cheerio.load(body);

      //         createFile(`${hrefUrl}`, $.text(), url, defaultPath, "css");
      //       }
      //     });

      //     element.attribs.href = `${defaultPath}${hrefUrl}`;
      //   });

      // a标签
      $("a[href]")
        .toArray()
        .forEach((element) => {
          if (exitFileArr.includes(element.attribs.href)) return;

          let hrefUrl = element.attribs.href;

          const pathArr: Array<string | never> = hrefUrl.split("/");
          if (pathArr[pathArr.length - 1] === "") {
            //'/txt/wuxia' => ['','txt','wuxia',''] => ['','txt','wuxia','index.xxx']
            pathArr[pathArr.length - 1] = `index.html`;
            // 新文件相对路径
            hrefUrl = pathArr.join("/");
          }
          if (/\#/g.test(hrefUrl) || fs.existsSync(`${defaultPath}${hrefUrl}`))
            return;

          spiderHtml(url + hrefUrl);
          // 修改路径为相对路径
          element.attribs.href = `${defaultPath}${hrefUrl}`;
        });

      // createFile(`/index.html`, $.html(), url, defaultPath, "html");
      // fs.writeFile(`${defaultPath}${filePath}`, content, {}, () => {});
      // exitFileArr.push(filePath);
      // 查看是否有重复元素
      console.log(
        exitFileArr.length,
        new Set(exitFileArr).size != exitFileArr.length
      );
    }
  });
};

spiderHtml(webUrl);

// exports = spiderHtml;
