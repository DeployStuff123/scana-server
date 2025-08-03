export const isUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).send('Unauthorized');
  }
  next();
}
