// Pruebas de la reserva en los navegadores de iPhone, Android, Mac y Windows (etapa 8 de la skill).
// Uso: npx playwright test
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './pruebas-e2e',
  timeout: 60_000,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5511/',
    timezoneId: 'Europe/Madrid',
    locale: 'es-ES',
  },
  webServer: {
    command: 'python -m http.server 5511 --bind 127.0.0.1 --directory sitio',
    url: 'http://127.0.0.1:5511/index.html',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'iPhone 14 (Safari)', use: { ...devices['iPhone 14'] } },
    { name: 'Pixel 7 (Android)', use: { ...devices['Pixel 7'] } },
    { name: 'Mac (Safari)', use: { ...devices['Desktop Safari'] } },
    { name: 'Windows (Chrome)', use: { ...devices['Desktop Chrome'] } },
    { name: 'Windows (Firefox)', use: { ...devices['Desktop Firefox'] } },
  ],
});
