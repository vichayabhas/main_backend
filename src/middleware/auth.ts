
import jwt from 'jsonwebtoken';
import User, { buf } from '../models/User';
import { NextFunction } from 'express'
import express from "express";
import { resError } from "../controllers/setup";
const testJwt = buf
export async function protect(req: express.Request, res: express.Response, next: NextFunction) {
  let token: string | null | undefined;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }
  if (!token) {
    return res.status(401).json({ success: false, massage: 'Not authorize to access this route' });
  }
  try {
    const decoded = jwt.verify(token, testJwt)
    const { id } = decoded as { id: string }
    const user = await User.findById(id)
    if (!user) {
      return res.status(401).json({ success: false, massage: 'Not authorize to access this route' });
    }
    next();
  } catch (error) {
    console.log(error.stack)
    return res.status(401).json({ success: false, massage: 'Not authorize to access this route' });
  }
}
export function authorize(...roles: string[]) {
  return async (req: express.Request, res: express.Response, next: NextFunction) => {
    let token: string | null | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) {
      return res.status(401).json({ success: false, massage: 'Not authorize to access this route' });
    }
    const decoded = jwt.verify(token.toString(), testJwt)
    const { id } = decoded as { id: string }
    const user = await User.findById(id)
    if (!user) {
      return res.status(401).json({ success: false, massage: 'Not authorize to access this route' });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ success: false, msg: `User role ${user.role} is not authorized to access` })
    }
    next();
  }
}
export async function getUser(req: express.Request) {
  let token: string | null | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }
  if (!token) {
    return null
  }
  const decoded = jwt.verify(token.toString(), testJwt)
  const { id } = decoded as { id: string }
  const user = await User.findById(id).select("+password");
  return user
}
export async function modePee(req: express.Request, res: express.Response, next: NextFunction) {
  const user = await getUser(req)
  if (user?.mode != 'pee') {
    return res.status(403).json({ success: false, message: `User role ${user?.mode} is not authorize to access this route` });
  }
  next();
}
export async function admin(req: express.Request, res: express.Response, next: NextFunction) {
  const user = await getUser(req)

  if (user?.role != 'admin') {
    return res.status(403).json({ success: false, message: `User role ${user?.role} is not authorize to access this route` });
  }
  next();
}
export async function pee(req: express.Request, res: express.Response, next: NextFunction) {
  const user = await getUser(req)
  if (!user) {
    return
  }
  if (!['pee', 'peto', 'admin'].includes(user.role)) {
    return res.status(403).json({ success: false, message: `User role ${user.role} is not authorize to access this route` });
  }
  next();
}
export async function authCamp(req: express.Request, res: express.Response, next: NextFunction) {
  const user = await getUser(req)

  if (!user?.authorizeIds.includes(req.body.campId) && user?.role != 'admin') {
    return res.status(403).json({ success: false, message: `User role ${user?.role} is not authorize to access this route` });
  }
  next();
}
export async function peto(req: express.Request, res: express.Response, next: NextFunction) {
  const user = await getUser(req)
  if (!['peto', 'admin'].includes(user?.role as string)) {
    return res.status(403).json({ success: false, message: `User role ${user?.role} is not authorize to access this route` });
  }
  next();
}
export function isLogin(withIn: express.RequestHandler, withOut: express.RequestHandler | null) {
  return async (req: express.Request, res: express.Response, next: NextFunction) => {
    let token: string | null | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) {
      if (withOut) {
        withOut(req, res, next)
      } else {
        res.status(403).json(resError)
      }

      return
    }
    try {
      const decoded = jwt.verify(token.toString(), testJwt)
      const { id } = decoded as { id: string }
      const user = await User.findById(id)
      if (!user) {
        if (withOut) {
          withOut(req, res, next)
        } else {
          res.status(403).json(resError)
        }

        return
      }
      withIn(req, res, next)
    } catch {
      if (withOut) {
        withOut(req, res, next)
      } else {
        res.status(403).json(resError)
      }
      return
    }
  }
}
export async function isPass(req: express.Request, res: express.Response, next: NextFunction) {
  console.log('hhhhhhnjmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmppppppppppppppppppppppppppppppppppppp')
  next()
}



