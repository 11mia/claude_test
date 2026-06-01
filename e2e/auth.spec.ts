import { test, expect } from '@playwright/test'

test.describe('인증 플로우', () => {
  test('미인증 사용자는 /login으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('로그인 페이지가 정상 렌더링된다', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('StockRadar 로그인')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('회원가입 페이지가 정상 렌더링된다', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByText('StockRadar 회원가입')).toBeVisible()
  })

  test('로그인 페이지에서 회원가입 링크가 작동한다', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: '회원가입' }).click()
    await expect(page).toHaveURL(/\/signup/)
  })

  test('잘못된 자격증명으로 로그인 시 에러가 표시된다', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('invalid@example.com')
    await page.locator('input[type="password"]').fill('wrongpassword')
    await page.getByRole('button', { name: '로그인' }).click()
    await expect(page.locator('p.text-red-600')).toBeVisible({ timeout: 10000 })
  })
})
