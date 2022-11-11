import { Download, PageInfoProcessing } from "./class";
import { PageInfo } from "./Interface/interface";

/**
 * A array which wait downloading
 */
let waitDownload: PageInfo[] = [];

/**
 * A array which has downloaded
 */
let hasDownload: Readonly<PageInfo>[] = [];

/**
 * @param pageInfo The obj which is instanceof the PageInfoProcessing
 */
function whetherPushIntoWL(pageInfo: PageInfoProcessing) {
  if (!hasDownload.includes(pageInfo.info)) {
    waitDownload.push(pageInfo.info);
    console.log(`页面${pageInfo.info.webUrl}成功加入待下载队列`);
  }
}

/**
 * The function which start download
 * @param defaultPath The default download path
 * @param webIndexUrl The web Index url
 * @param limit The number of download page
 */
function entry(defaultPath: string, webIndexUrl: string) {
  /**
   * Index page
   */
  const index = new PageInfoProcessing(webIndexUrl, webIndexUrl);
  whetherPushIntoWL(index);

  /**
   * The loop download waitDownload Array
   */
  for (let i = 0; waitDownload.length !== 0; i++) {
    console.log(waitDownload);
    // 需要下载的页面
    const PAGE = waitDownload[0];
    console.log(`准备下载${PAGE.webUrl}`);
    const download = new Download(defaultPath, PAGE);

    // 下载页面
    download.downloadFile();

    // 加入hasDownload数组
    hasDownload.push(PAGE);
    // 从waitDownload队列移除
    waitDownload.shift();
  }
}
entry("D:/Do_it/web/downode.js/download", "typeorm.bootcss.com");

export { entry, waitDownload, hasDownload, whetherPushIntoWL };
