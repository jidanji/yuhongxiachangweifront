function buildEnv() {
  const host = window.location.host;

  if (['139.224.193.145:7744'].includes(host)) {
    return 'prod';
  } else if (['127.0.0.1', 'localhost'].includes(host)) {
    return 'development';
  }
  return 'development';
}
export default buildEnv();
