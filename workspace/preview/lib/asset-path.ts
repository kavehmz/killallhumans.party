// Static deployments may live at the domain root or a GitHub project subpath.
export function assetPath(path: `/${string}`) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`;
}
