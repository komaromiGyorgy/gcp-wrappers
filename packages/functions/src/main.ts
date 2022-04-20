import { awesomeFn } from '@gcp-wrappers/config';
const alma = '123123'
export async function main() {
  // dependencies across child packages
  console.log('alma :>> ', alma);
  console.log('alma :>> ', alma);
  return awesomeFn();
}
