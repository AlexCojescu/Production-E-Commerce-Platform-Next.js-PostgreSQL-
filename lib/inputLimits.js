/** @typedef {import('./requestBody.js').ValidationError} ValidationError */

export const LIMITS = {
  COUPON_CODE: 32,
  EMAIL: 254,
  NAME: 100,
  STREET: 200,
  CITY: 100,
  STATE: 100,
  ZIP: 20,
  COUNTRY: 100,
  PHONE: 30,
  PRODUCT_NAME: 150,
  PRODUCT_DESCRIPTION: 5000,
  CATEGORY: 80,
  BRAND: 80,
  CONDITION: 40,
  SIZE: 20,
  REVIEW: 2000,
  STORE_NAME: 150,
  STORE_USERNAME: 50,
  STORE_DESCRIPTION: 2000,
  STORE_ADDRESS: 300,
  STORE_CONTACT: 30,
  CART_MAX_ITEMS: 50,
  ORDER_MAX_ITEMS: 50,
  ORDER_MAX_QUANTITY: 99,
}

/** RFC 5322–style email check (local part @ domain with TLD) */
export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * @param {unknown} value
 */
export function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > LIMITS.EMAIL) return false;
  return EMAIL_REGEX.test(trimmed);
}

/**
 * @param {unknown} value
 * @param {string} [fieldName]
 */
export function requireEmail(value, fieldName = 'email') {
  const trimmed = requireString(value, LIMITS.EMAIL, fieldName);
  if (!isValidEmail(trimmed)) {
    throw new InputValidationError(`${fieldName} must be a valid email address`);
  }
  return trimmed.toLowerCase();
}

export class InputValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'InputValidationError'
  }
}

/**
 * @param {unknown} value
 * @param {number} max
 * @param {string} fieldName
 */
export function requireString(value, max, fieldName) {
  if (typeof value !== 'string') {
    throw new InputValidationError(`${fieldName} must be a string`)
  }
  const trimmed = value.trim()
  if (!trimmed) {
    throw new InputValidationError(`${fieldName} is required`)
  }
  if (trimmed.length > max) {
    throw new InputValidationError(`${fieldName} must be at most ${max} characters`)
  }
  return trimmed
}

/**
 * @param {unknown} value
 * @param {number} max
 * @param {string} fieldName
 */
export function optionalString(value, max, fieldName) {
  if (value == null || value === '') return undefined
  return requireString(value, max, fieldName)
}

/**
 * Coupon / invite-style codes: uppercase alphanumeric + hyphen/underscore.
 * @param {unknown} value
 */
export function requireCouponCode(value) {
  const code = requireString(value, LIMITS.COUPON_CODE, 'code').toUpperCase()
  if (!/^[A-Z0-9_-]+$/.test(code)) {
    throw new InputValidationError('code contains invalid characters')
  }
  return code
}

/**
 * @param {unknown} cart
 */
export function validateCartPayload(cart) {
  if (!cart || typeof cart !== 'object' || Array.isArray(cart)) {
    throw new InputValidationError('Invalid cart format')
  }
  const keys = Object.keys(cart)
  if (keys.length > LIMITS.CART_MAX_ITEMS) {
    throw new InputValidationError(`Cart cannot exceed ${LIMITS.CART_MAX_ITEMS} items`)
  }
  return cart
}

/**
 * @param {unknown} items
 */
export function validateOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new InputValidationError('Order items are required')
  }
  if (items.length > LIMITS.ORDER_MAX_ITEMS) {
    throw new InputValidationError(`Orders cannot exceed ${LIMITS.ORDER_MAX_ITEMS} items`)
  }
  for (const item of items) {
    if (!item || typeof item !== 'object') {
      throw new InputValidationError('Invalid order item')
    }
    const quantity = Number(item.quantity)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > LIMITS.ORDER_MAX_QUANTITY) {
      throw new InputValidationError(`Each item quantity must be between 1 and ${LIMITS.ORDER_MAX_QUANTITY}`)
    }
    if (typeof item.id !== 'string' || !item.id.trim()) {
      throw new InputValidationError('Invalid product id in order item')
    }
  }
  return items
}

/**
 * @param {Record<string, unknown>} fields
 */
export function validateAddressFields(fields) {
  return {
    name: requireString(fields.name, LIMITS.NAME, 'name'),
    email: requireEmail(fields.email, 'email'),
    street: requireString(fields.street, LIMITS.STREET, 'street'),
    city: requireString(fields.city, LIMITS.CITY, 'city'),
    state: requireString(fields.state, LIMITS.STATE, 'state'),
    zip: requireString(fields.zip, LIMITS.ZIP, 'zip'),
    country: requireString(fields.country, LIMITS.COUNTRY, 'country'),
    phone: requireString(fields.phone, LIMITS.PHONE, 'phone'),
  }
}

/**
 * @param {Record<string, unknown>} body
 */
export function validateProductFields(body) {
  return {
    name: requireString(body.name, LIMITS.PRODUCT_NAME, 'name'),
    description: requireString(body.description, LIMITS.PRODUCT_DESCRIPTION, 'description'),
    category: requireString(body.category, LIMITS.CATEGORY, 'category'),
    brand: requireString(body.brand, LIMITS.BRAND, 'brand'),
    condition: requireString(body.condition, LIMITS.CONDITION, 'condition'),
    size: requireString(body.size, LIMITS.SIZE, 'size'),
  }
}
