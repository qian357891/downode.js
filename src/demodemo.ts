let webUrl = "www.baidu.com/";
// console.log(/\/$/.test(webUrl));
// console.log(webUrl.substring(-1, webUrl.length - 1));
// console.log(webUrl);
webUrl = /\/$/.test(webUrl) ? webUrl.substring(0, webUrl.length - 1) : webUrl;
console.log(webUrl);
