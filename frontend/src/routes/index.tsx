import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CitiesQueryOptions } from "../queriesOptions/CitiesQueryOptions";
import type { LatLngExpression } from "leaflet";
import { useSuspenseQuery } from "@tanstack/react-query";
import MapOfCities from "../components/ui/MapOfCities";
import CitySkeleton from "../components/ui/CitySkeleton";

export const Route = createFileRoute("/")({
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
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Добро пожаловать</h1>
        <a href="/cities" className="btn btn-primary">
          Перейти к городам
        </a>
        {isLoading && <CitySkeleton />}
        {isError && <div className="text-red-500">Ошибка: {error.message}</div>}
        {data && isSuccess && <MapOfCities center={center} cities={data} />}
      </div>
    </motion.div>
  );
}
