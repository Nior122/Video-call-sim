async function test() {
  const url = 'https://morencius.com/embed/kwzci5gipc7o';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Referer': 'https://rubyvidhub.com/' } });
  const text = await res.text();
  const match = text.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?\.split\('\|'\)\)\)/);
  if(match) {
      const code = match[0].replace(/^eval/, '');
      const unpacked = eval(code);
      const m3u8Match = typeof unpacked === 'string' ? unpacked.match(/https?:[^\s\"'\\]+\.m3u8[^\s\"'\\]*/) : null;
      console.log('m3u8:', m3u8Match ? m3u8Match[0] : null);
  } else {
      console.log('No packer match');
  }
}
test();
