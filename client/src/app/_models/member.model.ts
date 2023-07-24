import { Photo } from './photo.model';

export interface Member {
  id: number
  userName: string
  age: number
  knownAs: string
  created: string
  lastActive: string
  gender: string
  introduction: string
  lookingFor: string
  interests: string
  city: string
  country: string
  photoUrl: string
  photos: Photo[]
}
