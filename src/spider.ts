import request from "request";
import cheerio from "cheerio";
import fs from "fs";
// 写入本地文件流
import https from "https";
import path from "path";

let x = 0;
const webUrl = "https://www.ijjxs.com";
const defaultPath = `D:/Do it/web/downode.js/download`;
fs.mkdirSync(defaultPath);

// 写入本地文件流（图片）
const downloadPic = (url: string) => {
  const req = https.request(url, (res) => {
    res.pipe(fs.createWriteStream(path.basename("demo.jpg")));
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
  const pathArr: Array<string | never> = filePath.split("/");
  if (pathArr[pathArr.length - 1] === "") {
    //'/txt/wuxia' => ['','txt','wuxia',''] => ['','txt','wuxia','index.xxx']
    pathArr[pathArr.length - 1] = `index.${fileType}`;
    // 新文件相对路径
    filePath = pathArr.join("/");
  }

  // 删除首项空字符串''
  pathArr.shift();

  if (pathArr.length === 1) return;
  // 如果是'/sss/aaa.xxx' => [ 'sss', 'aaa.xxx' ]，删尾项，如果是'/txt/wuxia' => '/txt/wuxia/index.html'
  pathArr.pop();
  let dir: string = "";
  for (const index in pathArr) {
    dir += "/" + pathArr[index];
    // 如果路径不存在，则创建
    if (!fs.existsSync(defaultPath + dir)) {
      fs.mkdirSync(defaultPath + dir);
    }
  }
  // 开始递归
  spiderHtml(`${webUrl}${filePath}`);

  if (fs.existsSync(`${defaultPath}${filePath}`)) return;

  fs.writeFile(`${defaultPath}${filePath}`, content, {}, (error) => {
    if (error) {
      return console.log("error");
    }

    return console.log(`${webUrl}${filePath} 下载完成`);
  });
};

const spiderHtml = (url: string) => {
  x++;
  console.log(x);
  // if (x > 500) return;
  request(url, (error, response, body) => {
    //res.statusCode 为200则表示链接成功
    if (error === null && response.statusCode === 200) {
      console.log(`${url}链接成功`);
      //使用cheerio来解析body（网页内容），提取我们想要的信息
      // const e = cheerio.load(body).html()
      const $ = cheerio.load(body);

      // sript标签
      $("script[src]")
        .toArray()
        .forEach((element) => {
          // src的相对链接
          const scriptSrc = element.attribs.src;

          request(url + scriptSrc, (error, response, body) => {
            if (error === null && response.statusCode === 200) {
              console.log(`${url + scriptSrc}链接成功`);
              const $ = cheerio.load(body);

              // 调用createFile方法
              createFile(`${scriptSrc}`, $.text(), url, defaultPath, "js");
            }
          });

          element.attribs.src = `${defaultPath}${scriptSrc}`;
        });

      // link标签
      $("link[href]")
        .toArray()
        .forEach((element) => {
          const hrefUrl = element.attribs.href;

          request(url + hrefUrl, (error, response, body) => {
            if (error === null && response.statusCode === 200) {
              console.log(`${url + hrefUrl}链接成功`);
              const $ = cheerio.load(body);

              createFile(`${hrefUrl}`, $.text(), url, defaultPath, "css");
            }
          });

          element.attribs.href = `${defaultPath}${hrefUrl}`;
        });

      // a标签
      $("a[href]")
        .toArray()
        .forEach((element) => {
          let hrefUrl = element.attribs.href;

          const pathArr: Array<string | never> = hrefUrl.split("/");
          if (pathArr[pathArr.length - 1] === "") {
            //'/txt/wuxia' => ['','txt','wuxia',''] => ['','txt','wuxia','index.xxx']
            pathArr[pathArr.length - 1] = `index.html`;
            // 新文件相对路径
            hrefUrl = pathArr.join("/");
          }

          request(url + hrefUrl, (error, response, body) => {
            if (error === null && response.statusCode === 200) {
              console.log(`${url + hrefUrl}链接成功`);
              const $ = cheerio.load(body);

              // 调用createFile方法
              createFile(`${hrefUrl}`, $.html(), url, defaultPath, "html");
            }
          });
          // 修改路径为相对路径
          element.attribs.href = `${defaultPath}${hrefUrl}`;
        });
      // 调用createFile方法
      // createFile("/index.html", $.html(), url, "../download", "html");

      if (x === 1)
        fs.writeFile(`${defaultPath}/index.html`, $.html(), {}, () => {});
      else {
        // 取得文件的相对路径
        const filePath = url.split(webUrl).join("");
        fs.writeFile(`${defaultPath}${filePath}`, $.html(), {}, () => {});
      }
    }
  });
};

spiderHtml(webUrl);
