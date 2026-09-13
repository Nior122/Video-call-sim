const fetch = require('node-fetch');
fetch("https://3uho6lzsf1c2o3i8oun9.streamruby.net/hls2/01/00492/aau1rmpdbpz8_,l,n,h,o,.urlset/master.m3u8?t=LG6ZzVbZAQZD9C6MmBJoDYQydWRCB7DcuDDGRgk-yP4&s=1789296337&e=32400&v=1817208139&i=2600:1900:0:4a00&sp=0").then(r => console.log(r.status)).catch(console.error);
