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
    image_path?: {
      String: string
      Valid: boolean
    }
    region_name?: string
    latitude: number
    longitude: number
}