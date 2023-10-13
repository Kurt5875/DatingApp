import { User } from "./user.model";

export class UserParams {
  gender: string;
  minAge = 18;
  maxAge = 99;
  pageNumber = 1;
  pageSize = 3;
  orderBy: string = 'lastActive';

  constructor(user: User) {
    this.gender = user.gender === 'male' ? 'female' : 'male';
  }
}
