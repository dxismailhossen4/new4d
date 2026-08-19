/** GitHub Pages compatibility: visual media remains served from the managed public asset origin so the independently hosted build has stable branded imagery. */
export const managedAssetOrigin = "https://4dinsight-deeeyrxh.manus.space";

export function managedAsset(path: string) {
  return `${managedAssetOrigin}/manus-storage/${path}`;
}
