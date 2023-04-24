import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default async (fastify: FastifyInstance) => {

  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      reply.status(200).send()
    } catch (e) {
      reply.status(500).send()
    }
  })

} 
