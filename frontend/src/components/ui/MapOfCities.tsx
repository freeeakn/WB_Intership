import type { LatLngExpression } from "leaflet";
import type { FC } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { City } from "../../types/types";

interface Props {
  center?: LatLngExpression;
  cities: City[];
}

const MapOfCities: FC<Props> = ({ center, cities }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Карта городов</h2>
      <MapContainer
        center={center}
        zoom={4}
        style={{ height: "800px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {cities.map((city: City) => (
          <Marker key={city.id} position={[city.latitude, city.longitude]}>
            <Popup>
              <div>
                <figure>
                  {city.image_path && city.image_path.Valid && (
                    <img
                      src={`http://localhost:8080/images/${city.id}`}
                      alt={city.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                </figure>
                <h3>{city.name}</h3>
                <p>Регион: {city.region_name}</p>
                <p>Население: {city.population.toLocaleString()} чел.</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapOfCities;
