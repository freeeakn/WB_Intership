import { queryOptions } from "@tanstack/react-query";
import { CitiesService } from "../services/CitiesService/CitiesService";

export const CitiesQueryOptions =
  queryOptions({
    queryKey: ["cities"],
    queryFn: CitiesService.getCities,
  });
