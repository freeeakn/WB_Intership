import { instance } from "../../instance/instance";
import type { Region } from "../../types/types";
import UrlBuilder from "../../utils/UrlBuilder";

const PATH = "/regions";
const { buildUrl } = new UrlBuilder(PATH);

export const RegionsService = {
  getRegions: async () => {
    return await instance
      .get<Region[]>(buildUrl(""))
      .then((response) => response.data);
  },
  postRegions: async (name: string) => {
    return await instance
      .post(buildUrl(""), { name })
      .then((response) => response.data);
  },
};
