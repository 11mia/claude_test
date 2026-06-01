import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? ''
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? ''

test.describe('대시보드 (로그인 필요)', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'E2E_TEST_EMAIL / E2E_TEST_PASSWORD 미설정')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill(TEST_EMAIL)
    await page.locator('input[type="password"]').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: '로그인' }).click()
    await expect(page).toHaveURL('/', { timeout: 15000 })
  })

  test('대시보드 홈이 정상 렌더링된다', async ({ page }) => {
    await expect(page.getByText('StockRadar', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Watchlist').first()).toBeVisible()
    await expect(page.getByText('글로벌 이슈').first()).toBeVisible()
    await expect(page.getByText('알림').first()).toBeVisible()
  })

  test('Watchlist 페이지가 정상 렌더링된다', async ({ page }) => {
    await page.goto('/watchlist')
    await expect(page.getByText('Watchlist')).toBeVisible()
    await expect(page.locator('input[placeholder*="티커"]')).toBeVisible()
  })

  test('이슈 피드 페이지가 정상 렌더링된다', async ({ page }) => {
    await page.goto('/issues')
    await expect(page.getByText('글로벌 이슈')).toBeVisible()
  })

  test('알림 페이지가 정상 렌더링된다', async ({ page }) => {
    await page.goto('/alerts')
    await expect(page.getByText('알림 센터')).toBeVisible()
  })

  test('로그아웃 후 /login으로 리다이렉트된다', async ({ page }) => {
    await page.getByRole('button', { name: '로그아웃' }).click()
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })
})
