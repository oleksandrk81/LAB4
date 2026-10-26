/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { BasketModel } from '../models/basket'
import * as security from '../lib/insecurity'
import * as utils from '../lib/utils'

export function retrieveBasket () {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const authenticatedUser = security.authenticatedUsers.get(req.headers.authorization?.replace('Bearer ', ''))

    if (!authenticatedUser) {
      return res.status(401).send('Unauthenticated')
    }

    // Проверяем, принадлежит ли запрашиваемая корзина текущему пользователю
    BasketModel.findOne({ where: { id, UserId: authenticatedUser.data.id } })
      .then((basket: BasketModel | null) => {
        if (basket) {
          // Возвращаем корзину в стандартном формате, который ожидает фронтенд
          res.json(utils.queryResultToJson(basket))
        } else {
          // Если корзина принадлежит другому пользователю — отказываем в доступе
          res.status(403).send('Access denied')
        }
      })
      .catch((error: Error) => {
        next(error)
      })
  }
}