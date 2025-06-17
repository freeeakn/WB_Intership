import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import type { City, Region } from "../../types/types";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RegionsService } from "../../services/RegionsService/RegionsService";
import { CitiesService } from "../../services/CitiesService/CitiesService";

const LocationMarker = ({
  setCoordinates,
}: {
  setCoordinates: (lat: number, lng: number) => void;
}) => {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setCoordinates(lat, lng);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

const AddCity = () => {
  const [city, setCity] = useState<Partial<City>>({
    name: "",
    region_id: 0,
    distance_to_moscow: 0,
    population: 0,
    latitude: 55.7558,
    longitude: 37.6173,
  });
  const [newRegionName, setNewRegionName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const distance = calculateDistance(
      55.7558,
      37.6173,
      city.latitude || 0,
      city.longitude || 0
    );
    setCity((prev) => ({ ...prev, distance_to_moscow: distance }));
  }, [city.latitude, city.longitude]);

  const { data: regions = [], isLoading: regionsLoading } = useQuery<Region[]>({
    queryKey: ["regions"],
    queryFn: RegionsService.getRegions,
  });

  const createRegionMutation = useMutation({
    mutationFn: RegionsService.postRegions,
    onSuccess: (newRegion) => {
      queryClient.setQueryData(["regions"], (old: Region[] | undefined) => [
        ...(old || []),
        newRegion,
      ]);
      setCity((prev) => ({ ...prev, region_id: newRegion.id }));
      setNewRegionName("");
      toast.custom((t) => (
        <span role="alert" className="alert alert-success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Новый регион добавлен!</span>
          <button onClick={() => toast.dismiss(t.id)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </span>
      ));
    },
    onError: (error) => {
      toast.error(`Ошибка создания региона: ${error.message}`);
    },
  });

  const createCityMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await CitiesService.postCity(formData);
        console.log("Response:", response); // Debug response
        return response;
      } catch (error) {
        console.error("Mutation Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.custom((t) => (
        <span role="alert" className="alert alert-success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Город успешно добавлен!</span>
          <button onClick={() => toast.dismiss(t.id)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </span>
      ));
      setCity({
        name: "",
        region_id: 0,
        distance_to_moscow: 0,
        population: 0,
        latitude: 55.7558,
        longitude: 37.6173,
      });
      setImage(null);
    },
    onError: (error) => {
      toast.custom((t) => (
        <span role="alert" className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Ошибка добавления: {error.message}</span>
          <button onClick={() => toast.dismiss(t.id)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </span>
      ));
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCity((prev) => ({
      ...prev,
      [name]: name === "population" ? Number(value) : value,
    }));
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCity((prev) => ({ ...prev, region_id: Number(e.target.value) }));
  };

  const handleNewRegionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRegionName.trim()) {
      createRegionMutation.mutate(newRegionName);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      city &&
      city.region_id &&
      city.name &&
      city.population &&
      city.population > 0
    ) {
      const formData = new FormData();
      formData.append("name", city.name || "");
      formData.append("region_id", city.region_id.toString());
      formData.append(
        "distance_to_moscow",
        city.distance_to_moscow?.toString() || "0"
      );
      formData.append("population", city.population.toString());
      formData.append("latitude", city.latitude?.toString() || "0");
      formData.append("longitude", city.longitude?.toString() || "0");
      if (image) formData.append("image", image);
      createCityMutation.mutate(formData);
    } else {
      toast((t) => (
        <div role="alert" className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Заполните все обязательные поля корректно</span>
          <button onClick={() => toast.dismiss(t.id)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      ));
    }
  };

  const setCoordinates = (lat: number, lng: number) => {
    setCity((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Добавить новый город</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Название города</span>
            </label>
            <input
              type="text"
              name="name"
              value={city.name || ""}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Выберите регион</span>
            </label>
            <select
              name="region_id"
              value={city.region_id || 0}
              onChange={handleRegionChange}
              className="select select-bordered w-full"
              required
            >
              <option value={0} disabled>
                Выберите регион
              </option>
              {regionsLoading ? (
                <option disabled>Загрузка...</option>
              ) : (
                regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="label">
              <span className="label-text">Или создайте новый регион</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Название нового региона"
              />
              <button
                type="button"
                onClick={handleNewRegionSubmit}
                className="btn btn-primary"
                disabled={!newRegionName.trim()}
              >
                Добавить регион
              </button>
            </div>
            {createRegionMutation.isError && (
              <div className="text-red-500 text-sm">
                Ошибка создания региона
              </div>
            )}
          </div>
          <div>
            <label className="label">
              <span className="label-text">Население</span>
            </label>
            <input
              type="number"
              name="population"
              value={city.population}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              min="0"
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Фотография города</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input file-input-bordered w-full"
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Выберите координаты на карте</span>
            </label>
            <MapContainer
              center={[55.7558, 37.6173]} // Default to Moscow
              zoom={4}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker setCoordinates={setCoordinates} />
              {city.latitude && city.longitude && (
                <Marker position={[city.latitude, city.longitude]}>
                  <Popup>Выбранная точка</Popup>
                </Marker>
              )}
            </MapContainer>
            <p className="mt-2">
              Широта: {city.latitude}, Долгота: {city.longitude}
            </p>
            <p className="mt-2">
              Расстояние до Москвы: {city.distance_to_moscow || 0} км
            </p>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={
              createCityMutation.isPending ||
              !city.region_id ||
              !city.name ||
              !city.population
            }
          >
            {createCityMutation.isPending ? "Добавление..." : "Добавить город"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default AddCity;
