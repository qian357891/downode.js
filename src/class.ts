import fs from "fs";
import request from "request";
import cheerio, { AnyNode } from "cheerio";
import { whetherPushIntoWL } from "./entry";
import { PageInfo } from "./Interface/interface";

// 用于首页
class PageInfoProcessing {
  constructor(
    public readonly webIndexUrl: string,
    private readonly _webUrl: string
  ) {}

  get webUrl(): string {
    return this._webUrl;
  }

  get ralative(): string {
    // return this.webIndexUrl.replace(this.webUrl, "");
    return "/";
  }

  /**
   * Return the obj which push into the hasDownload Array
   */
  get info(): PageInfo {
    return {
      webUrl: this.webUrl,
      relativePath: this.ralative,
    };
  }
}

// 用于页面中的超文本链接href
class DeriveProcessing extends PageInfoProcessing {
  constructor(webIndexUrl: string, relativePath: string) {
    super(webIndexUrl, relativePath);
  }
  override get webUrl(): string {
    return this.webIndexUrl + this.ralative;
  }
}

class Download {
  /**
   * @param defaultPath The default download path
   * @param pageInfo obj has processed in PageInfoProcessing
   */
  constructor(
    public readonly defaultPath: string,
    public readonly pageInfo: PageInfo
  ) {}
  //
  readonly webIndexUrl = this.pageInfo.webUrl.replace(
    this.pageInfo.relativePath,
    ""
  );
  // 创建文件夹
  createDir() {
    let filePathArr = this.pageInfo.relativePath.split("/");
    // 文件所处的根目录（文件夹）
    filePathArr.pop();
    filePathArr = filePathArr.filter((item) => {
      item !== "";
    });
    let dirPath = this.defaultPath;
    for (const index in filePathArr) {
      dirPath += "/" + filePathArr[index];
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
        console.log("创建文件夹" + dirPath);
      }
    }
  }
  // 拿到文件内容，以及修改原内容中的超链接的路径
  downloadFile() {
    request(
      this.pageInfo.webUrl,
      (
        error: null,
        response: { statusCode: number },
        body: string | Buffer | AnyNode | AnyNode[]
      ) => {
        if (error === null && response.statusCode === 200) {
          const $ = cheerio.load(body);
          // a标签
          $("a[href]")
            .toArray()
            .forEach((element) => {
              const relativePath = element.attribs.href;
              const pageInfo = new DeriveProcessing(
                this.webIndexUrl,
                relativePath
              );
              // 将页面中的超链接的pageInfo判断后压入待下载队列
              whetherPushIntoWL(pageInfo);
              // 将href的值改为默认路径+相对路径
              element.attribs.href = this.defaultPath + relativePath + ".html";
            });
          this.downloadBehavior($.html());
        }
      }
    );
  }
  // 下载文件
  downloadBehavior(fileContent: string) {
    if (!fs.existsSync(this.defaultPath + this.pageInfo.relativePath)) {
      this.createDir();
      fs.writeFile(
        this.defaultPath + this.pageInfo.relativePath + ".html",
        fileContent,
        {},
        (err) => {
          if (err) {
            console.log(this.pageInfo.webUrl + "下载失败！");
          } else {
            console.log(this.pageInfo.webUrl + "下载成功！");
          }
        }
      );
    }
  }
}

export { PageInfoProcessing, DeriveProcessing, Download };
