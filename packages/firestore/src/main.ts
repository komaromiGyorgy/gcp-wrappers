import { awesomeFn } from '@gcp-wrappers/config';

export async function main() {
  // dependencies across child packages
  const out = await awesomeFn();
  return out;
}
