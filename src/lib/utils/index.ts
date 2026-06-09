const defaultBrand = "protect.com";

const getMappedUrlParams = (url: string): Record<string, string> => {
  const urlObj = new URL(url);
  const params: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
};

export { defaultBrand, getMappedUrlParams };
