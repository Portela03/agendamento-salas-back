export class ApiError extends Error {
  public code: string
  public status: number

  constructor(code: string, message: string, status = 400) {
    super(message)
    this.code = code
    this.status = status
    this.name = 'ApiError'
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

export default ApiError
