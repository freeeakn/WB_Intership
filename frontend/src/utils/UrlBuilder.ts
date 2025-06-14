/**
 * A class for building URLs.
 */
class UrlBuilder {
  /**
   * The root path of the URL.
   * @type {string}
   */
  private rootPath: string;

  /**
   * Constructor for the UrlBuilder class.
   * @param rootPath The root path of the URL.
   */
  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  /**
   * Builds a query string from a query parameters object.
   * @param queryParams An object containing query parameters.
   * @returns The query string.
   */
  private buildQueryString = (queryParams?: {
    [key: string]: string | number | boolean | undefined | null;
  }): string => {
    if (!queryParams) {
      return "";
    }

    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(queryParams)) {
      if (value != null) {
        params.append(key, String(value));
      }
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  };

  /**
   * Builds a URL from a path and query parameters.
   * @param path The path of the URL.
   * @param queryParams An object containing query parameters.
   * @returns The built URL.
   */
  buildUrl = (
    path: string,
    queryParams?: {
      [key: string]: string | number | boolean | undefined | null;
    }
  ): string => {
    return `${this.rootPath}${path}${this.buildQueryString(queryParams)}`;
  };
}

export default UrlBuilder;
