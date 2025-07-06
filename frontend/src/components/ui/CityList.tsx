import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { City } from "../../types/types";
import { CitiesService } from "../../services/CitiesService/CitiesService";
import EditCityModal from "../modal/EditCityModal";

interface CityListProps {
  cities: City[];
}

const CityList = ({ cities }: CityListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const queryClient = useQueryClient();

  const updateCityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<City> }) => {
      if (!data.region_id) {
        throw new Error("ID региона обязателен");
      }
      return await CitiesService.putCity({ id, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
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
          <span>Город успешно обновлен!</span>
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
    onError: (error: any) => {
      console.error("Ошибка обновления города:", error);
      toast.error(error.message || "Не удалось обновить город");
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append("image", file);
      return await CitiesService.postImageByIdCity(id.toString(), formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (error) => {
      console.error("Ошибка загрузки изображения:", error);
      toast.error("Не удалось загрузить изображение");
    },
  });

  const deleteCityMutation = useMutation({
    mutationFn: async (id: number) => {
      return await CitiesService.deleteCity(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
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
          <span>Город успешно удален!</span>
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
      console.error("Ошибка удаления города:", error);
      toast.error("Не удалось удалить город");
    },
  });

  const openDialog = (city: City) => {
    setSelectedCity(city);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedCity(null);
  };

  const handleSave = async (updatedCity: Partial<City>, file: File | null) => {
    if (!selectedCity) return;

    try {
      await updateCityMutation.mutateAsync({
        id: selectedCity.id,
        data: updatedCity,
      });
      if (file) {
        await uploadImageMutation.mutateAsync({ id: selectedCity.id, file });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = (cityId: number) => {
    deleteCityMutation.mutate(cityId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cities.map((city) => (
        <div key={city.id} className="card bg-base-100 shadow-xl">
          <figure>
            {city.image_path && city.image_path.Valid && (
              <img
                src={`http://localhost:8080/images/${city.id}`}
                alt={city.name}
                className="w-full h-48 object-cover"
              />
            )}
          </figure>
          <div className="card-body">
            <h2 className="card-title">{city.name}</h2>
            <p>Регион: {city.region_name}</p>
            <p>Расстояние до Москвы: {city.distance_to_moscow} км</p>
            <p>Население: {city.population.toLocaleString()} чел.</p>
            <p>
              Широта: {city.latitude}, Долгота: {city.longitude}
            </p>
            <div className="card-actions justify-end">
              <button
                className="btn btn-primary"
                onClick={() => openDialog(city)}
                disabled={
                  updateCityMutation.isPending ||
                  uploadImageMutation.isPending ||
                  deleteCityMutation.isPending
                }
              >
                Редактировать
              </button>
            </div>
          </div>
        </div>
      ))}
      {selectedCity && (
        <EditCityModal
          city={selectedCity}
          isOpen={isDialogOpen}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeDialog}
        />
      )}
      {(updateCityMutation.isPending ||
        uploadImageMutation.isPending ||
        deleteCityMutation.isPending) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}
    </div>
  );
};

export default CityList;
