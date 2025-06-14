import { queryOptions } from "@tanstack/react-query";

export const CitiesQueryOptions = () =>
  queryOptions({
    queryKey: ['cities'],
    queryFn: () =>,
  })