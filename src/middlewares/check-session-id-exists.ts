import { FastifyReply, FastifyRequest } from 'fastify'
import { HTTP_CODES } from '../utils/http-code'

export const checkSessionIdExists = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return reply.status(HTTP_CODES.UNAUTHORIZED).send({
      error: 'Unauthorized',
    })
  }
}
