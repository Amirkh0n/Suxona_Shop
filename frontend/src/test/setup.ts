import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Ensure the DOM is reset between tests.
afterEach(() => {
  cleanup()
})
