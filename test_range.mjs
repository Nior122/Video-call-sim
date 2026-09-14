async function test() {
  const tsUrl = 'https://h85MclLE5sxF9yF.acek-cdn.com/hls2/01/08601/kwzci5gipc7o_n/seg-1-v1-a1.ts?t=riUesdkYGzNDKIGAFrEQB50_hoRbJlP3pwBxHgMmym8&s=1789354569&e=129600&f=43008217&srv=mnTs8JVdEBe4&i=0.4&sp=500&p1=mnTs8JVdEBe4&p2=mnTs8JVdEBe4&asn=29465';
  const headers = { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://rubyvidhub.com/', 'Range': 'bytes=0-' };
  const res = await fetch(tsUrl, { headers });
  console.log('Status directly with Range:', res.status);
}
test();
