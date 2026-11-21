import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EnrollmentSettings from './index';
import { buildPreview } from './preview';
import type { TemplateValues } from './types';

const defaults: TemplateValues = {
  header: 'Encontré estas inscripciones:',
  paid: '• {curso}: figura como pagada.',
  partial: '• {curso}: registra un pago parcial.',
  pending: '• {curso}: tiene el pago pendiente de confirmación.',
  review: '• {curso}: tiene un estado pendiente de revisión.',
  footer: 'Un pago reciente puede tardar en reflejarse.',
  notFound: 'No encontré una inscripción con esos datos.',
  askContact: 'Indicame el email y el celular.',
  rateLimited: 'Hiciste varias consultas seguidas.',
};

const renderSettings = (onSave = vi.fn()) => {
  render(<EnrollmentSettings value={{ whatsappLookupEnabled: false, templates: defaults }} defaults={defaults} saving={false} onSave={onSave} />);
  return onSave;
};

describe('EnrollmentSettings', () => {
  it('saves the WhatsApp switch and the edited wording', async () => {
    const onSave = renderSettings();

    await userEvent.click(screen.getByLabelText('Responder consultas de inscripción por WhatsApp'));
    const paid = screen.getByLabelText('Pago completo');
    await userEvent.clear(paid);
    await userEvent.type(paid, 'Tu {{curso} está pago.');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(onSave).toHaveBeenCalledWith({ whatsappLookupEnabled: true, templates: { paid: 'Tu {curso} está pago.' } });
  });

  it('blocks saving a status line that does not name the course', async () => {
    renderSettings();

    const paid = screen.getByLabelText('Pago completo');
    await userEvent.clear(paid);
    await userEvent.type(paid, 'Está pago');

    expect(screen.getByText('Debe incluir {curso}')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
  });

  it('blocks placeholders other than the course', async () => {
    renderSettings();

    const footer = screen.getByLabelText('Cierre');
    await userEvent.clear(footer);
    await userEvent.type(footer, 'Tu email {{email}');

    expect(screen.getByText('Solo se permite {curso}')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
  });

  it('restores the original wording and shows a live preview', async () => {
    renderSettings();

    const header = screen.getByLabelText('Encabezado');
    await userEvent.clear(header);
    await userEvent.type(header, 'Hola!');
    expect(screen.getByTestId('enrollment-preview').textContent).toContain('Hola!');

    await userEvent.click(screen.getByRole('button', { name: 'Restaurar textos originales' }));
    expect(screen.getByLabelText('Encabezado')).toHaveValue(defaults.header);
  });

  it('saves only what differs from the originals, trimmed, so restored texts follow future defaults', async () => {
    const onSave = renderSettings();

    const header = screen.getByLabelText('Encabezado');
    await userEvent.clear(header);
    await userEvent.type(header, '  Hola!  ');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(onSave).toHaveBeenLastCalledWith({ whatsappLookupEnabled: false, templates: { header: 'Hola!' } });

    await userEvent.click(screen.getByRole('button', { name: 'Restaurar textos originales' }));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(onSave).toHaveBeenLastCalledWith({ whatsappLookupEnabled: false, templates: {} });
  });
});

describe('buildPreview', () => {
  it('omits empty header and footer and inserts the sample course', () => {
    expect(buildPreview({ ...defaults, header: '', footer: '' }).split('\n')).toEqual([
      '• Curso de camisas: figura como pagada.',
      '• Curso de camisas: registra un pago parcial.',
      '• Curso de camisas: tiene el pago pendiente de confirmación.',
      '• Curso de camisas: tiene un estado pendiente de revisión.',
    ]);
  });
});
