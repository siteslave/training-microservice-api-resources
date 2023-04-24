import { Knex } from 'knex'

export class UserModel {

  constructor () { }

  read(db: Knex) {
    return db('users')
      .select('user_id', 'first_name', 'last_name')
      .orderBy('first_name', 'desc')
  }

  info(db: Knex, userId: any) {
    return db('users').where('user_id', userId).first()
  }

  search(db: Knex, query: string) {
    const _query = `%${query}%`;
    return db('users')
      .where('first_name', 'like', _query)
      .orderBy('first_name', 'desc')
  }

  update(db: Knex, userId: any, data: any) {
    return db('users')
      .where('user_id', userId)
      .update(data)
  }

  remove(db: Knex, userId: any) {
    return db('users')
      .where('user_id', userId)
      .del()
  }


}
