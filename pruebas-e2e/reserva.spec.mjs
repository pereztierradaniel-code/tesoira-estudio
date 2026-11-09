// Reserva completa con el reloj fijado a cuatro horas delicadas (hora de Pontevedra).
// Servicio: Corte hombre (30 min). Margen de la web: no se puede pedir una hora que empieza en menos de 30 min.
import { test, expect } from '@playwright/test';

const casos = [
  { nombre: 'jueves 12:00', hora: '2026-11-05T12:00:00+01:00', primerDia: /jueves, 5 de noviembre$/, primeraHora: '13:00' },
  { nombre: 'jueves 23:55', hora: '2026-11-05T23:55:00+01:00', primerDia: /viernes, 6 de noviembre$/, primeraHora: '9:30', hoyCerrado: true },
  { nombre: 'viernes 00:05', hora: '2026-11-06T00:05:00+01:00', primerDia: /viernes, 6 de noviembre$/, primeraHora: '9:30' },
  { nombre: 'sábado 23:59', hora: '2026-11-07T23:59:00+01:00', primerDia: /martes, 10 de noviembre$/, primeraHora: '9:30', hoyCerrado: true },
];

for (const c of casos) {
  test(`reserva completa · ${c.nombre}`, async ({ page }) => {
    const errores = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await page.clock.setFixedTime(new Date(c.hora));
    await page.goto('/index.html');
    await expect(page.locator('html')).toHaveClass(/listo/, { timeout: 15_000 });
    // servicios.js ya está cargado cuando ha escrito la fecha del ticket
    await expect(page.locator('[data-ticket-fecha]')).not.toBeEmpty({ timeout: 15_000 });
    await expect(page.locator('html')).toHaveAttribute('data-reserva-lista', 'si', { timeout: 15_000 });

    // Ticket → reserva
    await page.locator('[data-ticket="corte-hombre"].servicio__mas').click();
    await expect(page.locator('[data-ticket-total]')).toHaveText('16 €');
    await page.locator('[data-ticket-reservar]').click();
    const dialogo = page.locator('[data-reserva]');
    await expect(dialogo).toBeVisible();
    await expect(page.locator('#r-s-corte-hombre')).toBeChecked();
    const seguir = page.locator('[data-reserva-seguir]');
    await seguir.click(); // paso 2
    await seguir.click(); // paso 3

    // Día: el primero del calendario es hoy; el primer día libre es el esperado
    const primero = page.locator('.calendario__dia').first();
    if (c.hoyCerrado) await expect(primero).toBeDisabled();
    const libre = page.locator('.calendario__dia:not([disabled])').first();
    await expect(libre).toHaveAttribute('aria-label', c.primerDia);
    await libre.click();
    await seguir.click(); // paso 4

    // Hora
    const hora = page.locator('.hora').first();
    await expect(hora).toHaveText(c.primeraHora);
    await hora.click();
    await seguir.click(); // paso 5

    // Datos: primero con error, luego bien
    await page.locator('#r-nombre').fill('Ana Prueba');
    await page.locator('#r-telefono').fill('123');
    await seguir.click();
    await expect(page.locator('[data-error="telefono"]')).not.toBeEmpty();
    await page.locator('#r-telefono').fill('612 345 678');
    await page.locator('#r-privacidad').check();
    await seguir.click(); // paso 6

    // Resumen en modo demostración (el negocio es ficticio y no tiene WhatsApp)
    await expect(page.locator('[data-reserva-demo]')).toBeVisible();
    await expect(page.locator('[data-reserva-whatsapp]')).toBeHidden();
    const mensaje = await page.locator('[data-reserva-mensaje]').textContent();
    expect(mensaje).toContain('Corte hombre');
    expect(mensaje).toContain(`Hora: ${c.primeraHora.padStart(5, '0')}`);
    expect(mensaje).toContain('Nombre: Ana Prueba');
    expect(mensaje).toContain('Teléfono: 612 345 678');
    expect(mensaje).toMatch(new RegExp(`Día: ${c.primerDia.source.replace('$', '')}`));

    // Terminar cierra y no queda nada personal en el navegador
    await seguir.click();
    await expect(dialogo).toBeHidden();
    expect(await page.evaluate(() => localStorage.length)).toBe(0);
    expect(errores).toEqual([]);
  });
}
