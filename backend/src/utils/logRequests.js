export function logRequests(req, res, next) {
  console.log(`[Backend] ${req.method} ${req.url}`)
  next()
}
