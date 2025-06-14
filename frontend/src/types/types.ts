export interface Region {
  id: number
  name: string
}

export interface City {
  id: number
  name: string
  region_id: number
  distance_to_moscow: number
  population: number
  image_path?: string
  region_name?: string
}