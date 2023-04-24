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

      const users = await userModel.read(db);
      reply
        .status(200)
        .send({ ok: true, users })
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
