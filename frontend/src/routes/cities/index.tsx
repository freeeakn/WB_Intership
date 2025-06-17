import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import CityList from "../../components/ui/CityList";
import { CitiesQueryOptions } from "../../queriesOptions/CitiesQueryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { LatLngExpression } from "leaflet";
import MapOfCities from "../../components/ui/MapOfCities";
import CitySkeleton from "../../components/ui/CitySkeleton";

export const Route = createFileRoute("/cities/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(CitiesQueryOptions),
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isSuccess, isError, error, isLoading } =
    useSuspenseQuery(CitiesQueryOptions);
  const center: LatLngExpression = [55.7558, 37.6173];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Список городов</h1>
        {isLoading && <CitySkeleton />}
        {isError && <div className="text-red-500">Ошибка: {error.message}</div>}
        {data && isSuccess && (
          <>
            <CityList cities={data} />
            <MapOfCities center={center} cities={data} />
          </>
        )}
      </div>
    </motion.div>
  );
}
