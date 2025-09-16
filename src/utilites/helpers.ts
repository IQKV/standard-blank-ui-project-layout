/* eslint-disable @typescript-eslint/no-explicit-any */

export function isNumber(value: any): value is number {
  return typeof value === "number";
}

export const isObjectEmpty = (objectName: any) => {
  return Object.keys(objectName).length === 0;
};

export const pluck = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const ret: any = {};
  for (const key of keys) {
    ret[key] = obj[key];
  }
  return ret;
};

export const addQueryStringToUrl = (key: string, value: string): void => {
  const currentUrl = new URL(window?.location.href);

  if (!currentUrl.searchParams.has(key)) {
    currentUrl.searchParams.append(key, value);
  }

  window?.history.pushState({}, "", currentUrl.toString());
};

export const removeQueryStringFromUrl = (key: string): void => {
  const currentUrl = new URL(window?.location.href);

  if (currentUrl.searchParams.has(key)) {
    currentUrl.searchParams.delete(key);
  }

  window?.history.pushState({}, "", currentUrl.toString());
};
export const getUrlParam = (paramName: string) => {
  const params = new URLSearchParams(window?.location.search);
  return params.get(paramName);
};

export const formatNumber = (number: number) => {
  if (!isNumber(number)) {
    return 0;
  }

  return new Intl.NumberFormat().format(number);
};

export const isEmptyHtml = (content: string) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;
  const textContent = tempDiv.textContent?.trim();
  return textContent === "" || textContent === null;
};
