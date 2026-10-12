import { FastifyReply, FastifyRequest } from 'fastify'
import { httpCodes } from '@/utils/http-code'

export const checkSessionIdExists = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return reply.status(httpCodes.UNAUTHORIZED).send({
      error: 'Unauthorized',
    })
  }
}
