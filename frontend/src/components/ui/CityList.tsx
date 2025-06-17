import type { City } from "../../types/types";

interface CityListProps {
  cities: City[];
}

const CityList = ({ cities }: CityListProps) => {
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
              <button className="btn btn-primary">Подробнее</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CityList;
