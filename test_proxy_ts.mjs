async function test() {
  const tsProxyUrl = 'http://localhost:3000/api/hls-proxy?url=https%3A%2F%2Fh85mclle5sxf9yf.acek-cdn.com%2Fhls2%2F01%2F08601%2Fkwzci5gipc7o_n%2Fseg-1-v1-a1.ts%3Ft%3Du9k3UNFCz9GFiuKXkUkFpwEkjg37dy6gfK-kO_D9OvU%26s%3D1789354380%26e%3D129600%26f%3D43008217%26srv%3DmnTs8JVdEBe4%26i%3D0.4%26sp%3D500%26p1%3DmnTs8JVdEBe4%26p2%3DmnTs8JVdEBe4%26asn%3D29465';
  const res = await fetch(tsProxyUrl);
  console.log('Status:', res.status);
  console.log('Content-Type:', res.headers.get('content-type'));
  const buffer = await res.arrayBuffer();
  console.log('Bytes:', buffer.byteLength);
}
test();
