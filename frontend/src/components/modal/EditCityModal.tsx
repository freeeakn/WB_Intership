import { useState } from "react";
import type { City, Region } from "../../types/types";
import toast from "react-hot-toast";
import { RegionsService } from "../../services/RegionsService/RegionsService";
import { useQuery } from "@tanstack/react-query";

interface EditCityModalProps {
  city: City;
  isOpen: boolean;
  onSave: (updatedCity: Partial<City>, file: File | null) => void;
  onDelete: (cityId: number) => void;
  onClose: () => void;
}

const EditCityModal = ({
  city,
  isOpen,
  onSave,
  onDelete,
  onClose,
}: EditCityModalProps) => {
  const [formData, setFormData] = useState<Partial<City>>({
    name: city.name,
    region_id: city.region_id,
    region_name: city.region_name,
    distance_to_moscow: city.distance_to_moscow,
    population: city.population,
    latitude: city.latitude,
    longitude: city.longitude,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    city.image_path && city.image_path.Valid
      ? `http://localhost:8080/images/${city.id}`
      : null
  );

  const { data: regions = [], isLoading: regionsLoading } = useQuery<Region[]>({
    queryKey: ["regions"],
    queryFn: RegionsService.getRegions,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "population" ||
        name === "distance_to_moscow" ||
        name === "latitude" ||
        name === "longitude" ||
        name === "region_id"
          ? Number(value)
          : value,
    }));
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
      region_name:
        regions.find((region) => region.id === Number(value))?.name ||
        prev.region_name,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(
        city.image_path && city.image_path.Valid
          ? `http://localhost:8080/images/${city.id}`
          : null
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.region_id) {
      toast.error("ID региона обязателен");
      return;
    }
    onSave(formData, selectedFile);
    onClose();
  };

  const handleDelete = () => {
    onDelete(city.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Редактировать город: {city.name}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Название города</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
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
              value={formData.region_id || ""}
              onChange={handleRegionChange}
              className="select select-bordered w-full"
              required
            >
              <option value="" disabled>
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
              <span className="label-text">Расстояние до Москвы (км)</span>
            </label>
            <input
              type="number"
              name="distance_to_moscow"
              value={formData.distance_to_moscow || 0}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Население (чел.)</span>
            </label>
            <input
              type="number"
              name="population"
              value={formData.population || 0}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Широта</span>
              </label>
              <input
                type="number"
                name="latitude"
                step="0.000001"
                value={formData.latitude || 0}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Долгота</span>
              </label>
              <input
                type="number"
                name="longitude"
                step="0.000001"
                value={formData.longitude || 0}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                required
              />
            </div>
          </div>
          <div>
            <label className="label">
              <span className="label-text">Фотография города</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full"
            />
            {previewUrl && (
              <div className="mt-4">
                <p className="label-text">Превью:</p>
                <img
                  src={previewUrl}
                  alt="Превью фотографии города"
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
            )}
          </div>
          <div className="modal-action">
            <button type="submit" className="btn btn-primary">
              Сохранить
            </button>
            <button
              type="button"
              className="btn btn-error"
              onClick={handleDelete}
            >
              Удалить
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCityModal;
