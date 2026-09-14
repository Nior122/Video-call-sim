async function test() {
  const m3u8Url = 'https://h85MclLE5sxF9yF.acek-cdn.com/hls2/01/08601/kwzci5gipc7o_n/master.m3u8?t=riUesdkYGzNDKIGAFrEQB50_hoRbJlP3pwBxHgMmym8&s=1789354569&e=129600&f=43008217&srv=mnTs8JVdEBe4&i=0.4&sp=500&p1=mnTs8JVdEBe4&p2=mnTs8JVdEBe4&asn=29465';
  const headers = { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://rubyvidhub.com/' };
  const res = await fetch(m3u8Url, { headers });
  console.log('Status with rubyvidhub referer:', res.status);
  
  const headers2 = { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://morencius.com/' };
  const res2 = await fetch(m3u8Url, { headers: headers2 });
  console.log('Status with morencius referer:', res2.status);
}
test();
