async function test() {
  const proxyUrl = 'http://localhost:3000/api/hls-proxy?embedUrl=https%3A%2F%2Fmorencius.com%2Fembed%2Fkwzci5gipc7o';
  const res = await fetch(proxyUrl);
  console.log('Status:', res.status);
  console.log(await res.text());
}
test();
