// import fs from "fs";
// import https from "https";
// import path from "path";

// const url =
//   "https://img.ijjxs.com/UploadPic/2022-10/xfi5klftq1d.jpg?x-oss-process=style/cover_s";

// const req = https.request(url, (res) => {
//   res.pipe(fs.createWriteStream(path.basename("demo.jpg")));
// });
// req.end();

const arr = [1, 2, 3, 4, 5];
const arr1 = [3, 4, 5, 6];
let i = 0;
arr.forEach((element) => {
  if (arr1.includes(element)) return;
  i++;
});
console.log(i);
