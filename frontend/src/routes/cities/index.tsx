import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import CityList from "../../components/ui/CityList";
import { CitiesQueryOptions } from "../../queriesOptions/CitiesQueryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/cities/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(CitiesQueryOptions),
  component: RouteComponent,
});

function RouteComponent() {
  const citiesQuery = useSuspenseQuery(CitiesQueryOptions);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Список городов</h1>
        {citiesQuery.isLoading && (
          <div className="text-center">Загрузка...</div>
        )}
        {citiesQuery.isError && (
          <div className="text-red-500">Ошибка: {citiesQuery.error.message}</div>
        )}
        {citiesQuery.isSuccess && <CityList cities={citiesQuery.data} />}
      </div>
    </motion.div>
  );
}
