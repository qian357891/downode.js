import { AnyNode, load } from "cheerio";
import request from "request";
import fs from "fs";
import { DeriveProcessing } from "./class";
import { entry, whetherPushIntoWL } from "./entry";

entry("D:/Do_it/web/downode.js/download", "https://typeorm.bootcss.com");

// request(
//   "https://typeorm.bootcss.com",
//   (
//     error: null,
//     response: { statusCode: number },
//     body: string | Buffer | AnyNode | AnyNode[]
//   ) => {
//     if (error === null && response.statusCode === 200) {
//       const $ = load(body);

//       fs.writeFile(
//         "D:/Do_it/web/downode.js/download" + "/index" + ".html",
//         $.html(),
//         {},
//         (err) => {
//           if (err) {
//             console.log("下载失败！");
//           } else {
//             console.log("下载成功！");
//           }
//         }
//       );
//     }
//   }
// );
