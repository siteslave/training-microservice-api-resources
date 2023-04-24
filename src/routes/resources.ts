import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Knex } from "knex";

import { AxiosResponse } from "axios"

import { UserModel } from '../models/user'

export default async (fastify: FastifyInstance) => {

  const userModel = new UserModel();
  const db: Knex = fastify.db;

  fastify.get('/list', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1m',
        keyGenerator: (request: any) => {
          return request.headers['x-auth-key'];
        }
      }
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {

    try {
      // introspect
      const accessToken = request.headers.authorization?.split(' ')[1];
      // Verify token
      const urlIntrospect = process.env.INTROSPECT_ENDPOINT;
      const response: AxiosResponse = await fastify.axios.get(urlIntrospect, {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });

      const data: any = response.data;
      const strKey = `USERLIST_${data.userId}`;

      console.log(strKey);

      // check redis
      const cacheResult: any = await fastify.redis.get(strKey);
      if (cacheResult) {
        console.log(cacheResult);
        const users = JSON.parse(cacheResult);
        reply
          .status(200)
          .headers({ 'x-cache': true })
          .send({ ok: true, users });
      } else {
        const users = await userModel.read(db);
        const results: any = JSON.stringify(users);
        // save to redis
        await fastify.redis.set(strKey, results, 'EX', 1 * 60 * 60);
        reply
          .status(200)
          .headers({ 'x-cache': false })
          .send({ ok: true, users });
      }

    } catch (error: any) {
      request.log.error(error);
      reply
        .status(500)
        .send({ ok: false, error: error.message })
    }

  })

  fastify.get('/info', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1m',
        keyGenerator: (request: any) => {
          return request.headers['x-auth-key'];
        }
      }
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {

    try {
      // introspect

      const accessToken = request.headers.authorization?.split(' ')[1];
      // Verify token
      const urlIntrospect = process.env.INTROSPECT_ENDPOINT;
      const response: AxiosResponse = await fastify.axios.get(urlIntrospect, {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });

      const { userId } = response.data;
      const users = await userModel.info(db, userId);
      reply
        .status(200)
        .send({ ok: true, users })
    } catch (error) {
      request.log.error(error);
      reply
        .status(500)
        .send({ ok: false, error: "Database connection failed." })
    }

  })

} 
