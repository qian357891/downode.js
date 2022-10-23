import request from "request";
import cheerio from "cheerio";
import fs from "fs";
import { HtmlSpiderInterface } from "./Interface/interface";

// 主要爬虫类
class HtmlSpider implements HtmlSpiderInterface {
  readonly defaultPath: string;
  readonly webUrl: string;
  readonly fileWebUrl: string;
  constructor(defultPath: string, webUrl: string, fileWebUrl: string) {
    this.defaultPath = defultPath;
    this.webUrl = webUrl;
    this.fileWebUrl = fileWebUrl;
  }
  // 文件保存的绝对路径
  get filePath(): string {
    return this.defaultPath + this.relativePath;
  }
  // 文件的相对路径
  get relativePath(): string {
    return "/" + this.fileWebUrl.replace(this.webUrl, "");
  }
  // 创建文件夹
  createDir() {
    let filePathToArr = this.relativePath.split("/");
    // 文件所处的根目录（文件夹）
    filePathToArr.pop();
    filePathToArr = filePathToArr.filter((item) => {
      item !== "";
    });
    let witchDirPath = this.defaultPath;
    for (const index in filePathToArr) {
      witchDirPath += "/" + filePathToArr[index];
      if (!fs.existsSync(witchDirPath)) {
        fs.mkdirSync(witchDirPath);
        console.log("创建文件夹");
      }
    }
  }
  // 获取内容文件
  get fileContent(): string {
    return request(this.fileWebUrl, (error, response, body) => {
      if (error === null && response.statusCode === 200) {
        const $ = cheerio.load(body);
        // a标签
        $("a[href]")
          .toArray()
          .forEach((element) => {
            let hrefUrl = element.attribs.href;
            new HtmlSpider(
              this.defaultPath,
              this.webUrl,
              this.webUrl + hrefUrl
            ).createFile();
            element.attribs.href = this.defaultPath + hrefUrl;
          });
        return $.html();
      }
      return "访问失败！";
    }) as unknown as string;
  }

  // 创建文件
  createFile() {
    if (!fs.existsSync(this.defaultPath)) {
      fs.writeFile(this.defaultPath, this.fileContent, {}, (err) => {
        if (err) {
          console.log(this.fileWebUrl + "下载失败！");
        } else {
          console.log(this.fileWebUrl + "下载成功！");
        }
      });
    }
  }
}

const spider = new HtmlSpider(
  "D:/Do it/web/downode.js/download",
  "http://www.ijjjxs.com/",
  "http://www.ijjjxs.com/"
);
console.log(spider.filePath);
console.log(spider.relativePath);
console.log(spider.fileWebUrl);
