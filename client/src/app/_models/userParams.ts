import { PaginationParams } from "./paginationParams.model";
import { User } from "./user.model";

export class UserParams implements PaginationParams {
  gender: string;
  minAge = 18;
  maxAge = 99;
  orderBy: string = 'lastActive';
  pageNumber = 1;
  pageSize = 3;

  constructor(user: User) {
    this.gender = user.gender === 'male' ? 'female' : 'male';
  }
}
