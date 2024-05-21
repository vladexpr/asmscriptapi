const BASE_64 = "base64";
const UTF_8 = "utf8";

export function base64Encode(s: string): string {
  return Buffer.from(s).toString(BASE_64);
}

export function base64Decode(s: string): string {
  return Buffer.from(s, BASE_64).toString(UTF_8);
}

export function uintArrToAscii(arr: Uint8Array): string {
  var encoded = "";
  for (let i = 0; i < arr.length; i++) {
    encoded += String.fromCharCode(arr[i]);
  }
  return encoded;
}

export function asciiToUintArr(s: string): Uint8Array {
  let decoded = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    decoded[i] = s.charCodeAt(i);
  }
  return decoded;
}
