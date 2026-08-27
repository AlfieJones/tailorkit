const { build } = require("esbuild");

module.exports = async function workerUrlLoader() {
  const { outputFiles } = await build({
    bundle: true,
    entryPoints: [this.resourcePath],
    format: "esm",
    platform: "browser",
    target: "es2022",
    write: false,
  });
  const source = outputFiles[0]?.text;

  if (!source) {
    throw new Error(`Unable to bundle worker entry ${this.resourcePath}.`);
  }

  const workerUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(source)}`;
  return `export default ${JSON.stringify(workerUrl)};`;
};
