import type { Request, Response, NextFunction } from 'express';

export function wellKnownContentTypes(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.path.endsWith('/apple-app-site-association')) {
    res.type('application/json');
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }

  if (req.path.endsWith('/assetlinks.json')) {
    res.type('application/json');
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }

  next();
}
