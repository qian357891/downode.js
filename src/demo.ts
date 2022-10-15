import fs from "fs";
import https from "https";
import path from "path";

const url =
  "https://img.ijjxs.com/UploadPic/2022-10/xfi5klftq1d.jpg?x-oss-process=style/cover_s";

const req = https.request(url, (res) => {
  res.pipe(fs.createWriteStream(path.basename("demo.jpg")));
});
req.end();
