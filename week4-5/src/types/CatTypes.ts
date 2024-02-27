import {LocationInput} from './DBTypes';

export interface CatInput {
  cat_name: string;
  weight: number;
  birthdate: Date;
  location: LocationInput;
  filename: string;
}
export interface CatModify {
  cat_name: string;
  weight: number;
  birthdate: Date;
  location: LocationInput;
}
