import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Minus,
  Plus,
  Scale,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';

type MovementType = 'ingreso' | 'gasto';

interface Movement {
  id: string;
  type: MovementType;
  concepto: string;
  montoCents: number;
  fecha: string;
  createdAt: number;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(value);
}

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function App() {
  const [movements, setMovements] = useState<Movement[]>([]);

  const [activeModal, setActiveModal] = useState<MovementType | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [dateInput, setDateInput] = useState(getTodayDateString);
  const [formError, setFormError] = useState('');
  const [lastAction, setLastAction] = useState<{
    type: MovementType;
    message: string;
  } | null>(null);

  const ingresosCount = movements.filter((m) => m.type === 'ingreso').length;
  const gastosCount = movements.filter((m) => m.type === 'gasto').length;

  const totalIngresosCents = movements.reduce(
    (sum, item) => (item.type === 'ingreso' ? sum + item.montoCents : sum),
    0
  );
  const totalGastosCents = movements.reduce(
    (sum, item) => (item.type === 'gasto' ? sum + item.montoCents : sum),
    0
  );
  const saldoCents = totalIngresosCents - totalGastosCents;

  const totalIngresos = totalIngresosCents / 100;
  const totalGastos = totalGastosCents / 100;
  const saldoDisponible = saldoCents === 0 ? 0 : saldoCents / 100;
  const isNegativeBalance = saldoCents < 0;

  const sortedMovements = [...movements].sort((a, b) => {
    const dateComparison = b.fecha.localeCompare(a.fecha);
    if (dateComparison !== 0) {
      return dateComparison;
    }
    return b.createdAt - a.createdAt;
  });

  function openModal(type: MovementType) {
    setActiveModal(type);
    setAmountInput('');
    setNoteInput('');
    setDateInput(getTodayDateString());
    setFormError('');
  }

  function closeModal() {
    setActiveModal(null);
    setFormError('');
  }

  function handleSubmitMovement(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalized = amountInput.replace(',', '.').trim();
    const parsedAmount = Number.parseFloat(normalized);
    const trimmedConcept = noteInput.trim();
    const montoCents = Number.isFinite(parsedAmount)
      ? Math.round(parsedAmount * 100)
      : 0;

    if (activeModal === 'ingreso') {
      if (!trimmedConcept) {
        setFormError('Ingresa el concepto del ingreso.');
        return;
      }
      if (!Number.isFinite(parsedAmount) || montoCents <= 0) {
        setFormError('El monto recibido debe ser mayor que cero.');
        return;
      }
      if (!dateInput) {
        setFormError('Selecciona la fecha del ingreso.');
        return;
      }

      const now = Date.now();
      const newMovement: Movement = {
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'ingreso',
        concepto: trimmedConcept,
        montoCents,
        fecha: dateInput,
        createdAt: now,
      };
      setMovements((prev) => [newMovement, ...prev]);
      setLastAction({
        type: 'ingreso',
        message: `Ingreso registrado correctamente: +${formatCurrency(montoCents / 100)} · ${trimmedConcept} · ${dateInput}`,
      });
    } else if (activeModal === 'gasto') {
      if (!trimmedConcept) {
        setFormError('Ingresa el concepto del gasto.');
        return;
      }
      if (!Number.isFinite(parsedAmount) || montoCents <= 0) {
        setFormError('El monto del gasto debe ser mayor que cero.');
        return;
      }
      if (!dateInput) {
        setFormError('Selecciona la fecha del gasto.');
        return;
      }

      const now = Date.now();
      const newMovement: Movement = {
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'gasto',
        concepto: trimmedConcept,
        montoCents,
        fecha: dateInput,
        createdAt: now,
      };
      setMovements((prev) => [newMovement, ...prev]);
      setLastAction({
        type: 'gasto',
        message: `Gasto registrado correctamente: -${formatCurrency(montoCents / 100)} · ${trimmedConcept} · ${dateInput}`,
      });
    }

    closeModal();
  }

  function handleDeleteMovement(movement: Movement) {
    setMovements((prev) => prev.filter((item) => item.id !== movement.id));
    setLastAction({
      type: movement.type,
      message: `${movement.type === 'ingreso' ? 'Ingreso' : 'Gasto'} eliminado: ${movement.concepto} (${formatCurrency(movement.montoCents / 100)})`,
    });
  }

  return (
    <div className="min-h-dvh bg-[#F6F8F7] text-[#0F1E17] flex flex-col">
      {/* Encabezado limpio y compacto */}
      <header className="bg-[#F6F8F7] border-b border-[#E2E8E4]">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0D4A34] text-white"
              aria-hidden="true"
            >
              <Wallet className="h-4 w-4" strokeWidth={2} />
            </span>
            <h1 className="font-display text-lg font-bold tracking-tight text-[#0F1E17] whitespace-nowrap truncate">
              Mi Dinero
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-[#56685E] whitespace-nowrap shrink-0">
            Finanzas personales
          </p>
        </div>
      </header>

      {/* Contenido principal adaptable */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Columna izquierda: Tarjeta de saldo disponible + Botones de acción */}
          <section
            aria-labelledby="saldo-heading"
            className="lg:col-span-7 flex flex-col gap-5"
          >
            {/* Tarjeta principal de Saldo Disponible */}
            <div
              className={`rounded-3xl text-white p-6 sm:p-8 shadow-sm transition-colors duration-200 ${
                isNegativeBalance ? 'bg-[#7A1B14]' : 'bg-[#0D4A34]'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  id="saldo-heading"
                  className={`text-sm font-medium tracking-wide ${
                    isNegativeBalance ? 'text-rose-100/95' : 'text-emerald-100/90'
                  }`}
                >
                  Saldo disponible
                </span>
                <span
                  className={`text-xs whitespace-nowrap ${
                    isNegativeBalance ? 'text-rose-100/80' : 'text-emerald-100/75'
                  }`}
                >
                  {isNegativeBalance
                    ? 'Saldo negativo · USD'
                    : 'Resumen actual · USD'}
                </span>
              </div>

              <div className="mt-4 sm:mt-5">
                <p
                  className="font-display text-4xl sm:text-5xl font-bold tracking-tight tabular-nums text-white"
                  aria-live="polite"
                >
                  {formatCurrency(saldoDisponible)}
                </p>
              </div>

              <div
                className={`mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm ${
                  isNegativeBalance ? 'text-rose-100/90' : 'text-emerald-100/85'
                }`}
              >
                <span>{isNegativeBalance ? 'Déficit actual' : 'Balance neto'}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {isNegativeBalance
                    ? 'Los gastos superan a los ingresos'
                    : 'Ingresos menos gastos'}
                </span>
              </div>
            </div>

            {/* Dos botones principales en escritorio/tablet (y accesibles también en móvil) */}
            <div
              className="hidden sm:grid grid-cols-2 gap-3.5"
              role="group"
              aria-label="Acciones rápidas"
            >
              <button
                type="button"
                onClick={() => openModal('ingreso')}
                className="min-h-[52px] px-5 py-3.5 rounded-2xl bg-[#0D4A34] hover:bg-[#0A3B29] active:scale-[0.99] text-white font-medium text-sm sm:text-base inline-flex items-center justify-center gap-2.5 transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D4A34]"
              >
                <Plus className="h-5 w-5 shrink-0" strokeWidth={2.2} />
                <span>Registrar ingreso</span>
              </button>

              <button
                type="button"
                onClick={() => openModal('gasto')}
                className="min-h-[52px] px-5 py-3.5 rounded-2xl bg-[#FFF5F5] hover:bg-rose-100/80 active:scale-[0.99] text-[#912018] border border-[#F3D0CE] font-medium text-sm sm:text-base inline-flex items-center justify-center gap-2.5 transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B42318]"
              >
                <Minus className="h-5 w-5 shrink-0 text-[#B42318]" strokeWidth={2.2} />
                <span>Registrar gasto</span>
              </button>
            </div>

            {lastAction && (
              <div
                role="status"
                aria-live="polite"
                className={`rounded-2xl border px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm ${
                  lastAction.type === 'ingreso'
                    ? 'bg-emerald-50 border-emerald-200 text-[#0D4A34]'
                    : 'bg-rose-50 border-rose-200 text-[#912018]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2.2} />
                  <p className="font-medium truncate">{lastAction.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLastAction(null)}
                  aria-label="Cerrar notificación"
                  className={`min-h-[36px] min-w-[36px] -mr-1.5 rounded-lg inline-flex items-center justify-center shrink-0 cursor-pointer ${
                    lastAction.type === 'ingreso'
                      ? 'text-[#0D4A34]/80 hover:bg-emerald-100/70 hover:text-[#0D4A34]'
                      : 'text-[#912018]/80 hover:bg-rose-100/70 hover:text-[#912018]'
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>

          {/* Columna derecha: Tres indicadores (Ingresos, Gastos, Saldo) */}
          <section
            aria-labelledby="indicadores-heading"
            className="lg:col-span-5 flex flex-col gap-4"
          >
            <div className="flex items-baseline justify-between px-1">
              <h2
                id="indicadores-heading"
                className="font-display text-base sm:text-lg font-semibold text-[#0F1E17]"
              >
                Indicadores
              </h2>
              <span className="text-xs text-[#56685E]">
                Ingresos · Gastos · Saldo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5">
              {/* Indicador 1: Ingresos */}
              <article className="rounded-2xl bg-white border border-[#D2E5DA] p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className="h-11 w-11 shrink-0 rounded-xl bg-emerald-50 text-[#0D4A34] flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <ArrowDownLeft className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#56685E]">
                      Ingresos
                    </p>
                    <p className="font-display text-xl sm:text-2xl font-bold text-[#0D4A34] tabular-nums truncate mt-0.5">
                      {totalIngresos > 0 ? `+${formatCurrency(totalIngresos)}` : formatCurrency(0)}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#0D4A34] whitespace-nowrap shrink-0">
                  Entradas · {ingresosCount}
                </span>
              </article>

              {/* Indicador 2: Gastos */}
              <article className="rounded-2xl bg-white border border-[#F3D0CE] p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className="h-11 w-11 shrink-0 rounded-xl bg-rose-50 text-[#B42318] flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#56685E]">
                      Gastos
                    </p>
                    <p className="font-display text-xl sm:text-2xl font-bold text-[#B42318] tabular-nums truncate mt-0.5">
                      {totalGastos > 0 ? `-${formatCurrency(totalGastos)}` : formatCurrency(0)}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#B42318] whitespace-nowrap shrink-0">
                  Salidas · {gastosCount}
                </span>
              </article>

              {/* Indicador 3: Saldo */}
              <article
                className={`rounded-2xl bg-white border p-4 sm:p-5 flex items-center justify-between gap-4 ${
                  isNegativeBalance ? 'border-[#F3D0CE]' : 'border-[#E2E8E4]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center ${
                      isNegativeBalance
                        ? 'bg-rose-50 text-[#B42318]'
                        : 'bg-[#F0F4F2] text-[#0F1E17]'
                    }`}
                    aria-hidden="true"
                  >
                    <Scale className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#56685E]">
                      Saldo
                    </p>
                    <p
                      className={`font-display text-xl sm:text-2xl font-bold tabular-nums truncate mt-0.5 ${
                        isNegativeBalance ? 'text-[#B42318]' : 'text-[#0F1E17]'
                      }`}
                    >
                      {formatCurrency(saldoDisponible)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap shrink-0 ${
                    isNegativeBalance ? 'text-[#B42318]' : 'text-[#56685E]'
                  }`}
                >
                  {isNegativeBalance ? 'Saldo negativo' : 'Disponible'}
                </span>
              </article>
            </div>
          </section>
        </div>

        {/* Módulo de historial de movimientos */}
        <section
          aria-labelledby="movimientos-heading"
          className="mt-8 rounded-3xl bg-white border border-[#E2E8E4] p-5 sm:p-6"
        >
          <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-[#E2E8E4]">
            <h2
              id="movimientos-heading"
              className="font-display text-base sm:text-lg font-semibold text-[#0F1E17]"
            >
              Historial de movimientos
            </h2>
            <span className="text-xs text-[#56685E] tabular-nums">
              {sortedMovements.length === 1
                ? '1 movimiento · Más reciente primero'
                : `${sortedMovements.length} movimientos · Más reciente primero`}
            </span>
          </div>

          {sortedMovements.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#56685E]">
              Aún no hay movimientos registrados. Registra un ingreso o un gasto para verlo en tu historial.
            </p>
          ) : (
            <ul className="divide-y divide-[#EDF1EE]">
              {sortedMovements.map((item) => {
                const isIngreso = item.type === 'ingreso';
                return (
                  <li
                    key={item.id}
                    className="py-3.5 flex items-center justify-between gap-3 sm:gap-4"
                  >
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                      <span
                        className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${
                          isIngreso
                            ? 'bg-emerald-50 text-[#0D4A34]'
                            : 'bg-rose-50 text-[#B42318]'
                        }`}
                        aria-hidden="true"
                      >
                        {isIngreso ? (
                          <ArrowDownLeft className="h-4 w-4" strokeWidth={2.2} />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#0F1E17] truncate">
                          {item.concepto}
                        </p>
                        <p className="text-xs text-[#56685E] mt-0.5">
                          <span
                            className={
                              isIngreso
                                ? 'font-medium text-[#0D4A34]'
                                : 'font-medium text-[#B42318]'
                            }
                          >
                            {isIngreso ? 'Ingreso' : 'Gasto'}
                          </span>
                          <span className="mx-1.5" aria-hidden="true">
                            ·
                          </span>
                          <span className="tabular-nums">{item.fecha}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <p
                        className={`font-display text-sm sm:text-base font-bold tabular-nums whitespace-nowrap ${
                          isIngreso ? 'text-[#0D4A34]' : 'text-[#B42318]'
                        }`}
                      >
                        {isIngreso ? '+' : '-'}
                        {formatCurrency(item.montoCents / 100)}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleDeleteMovement(item)}
                        aria-label={`Eliminar ${isIngreso ? 'ingreso' : 'gasto'}: ${item.concepto}`}
                        title="Eliminar movimiento"
                        className="min-h-[44px] min-w-[44px] -mr-2 rounded-xl text-[#56685E] hover:bg-rose-50 hover:text-[#B42318] inline-flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B42318]"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      {/* Barra de acciones fija en zona natural del pulgar para móviles */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E2E8E4] px-4 py-3">
        <div
          className="grid grid-cols-2 gap-3"
          role="group"
          aria-label="Acciones rápidas móviles"
        >
          <button
            type="button"
            onClick={() => openModal('ingreso')}
            className="min-h-[48px] px-3 py-2.5 rounded-xl bg-[#0D4A34] active:scale-[0.98] text-white font-medium text-sm inline-flex items-center justify-center gap-1.5 transition-transform whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D4A34]"
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2.2} />
            <span>Registrar ingreso</span>
          </button>

          <button
            type="button"
            onClick={() => openModal('gasto')}
            className="min-h-[48px] px-3 py-2.5 rounded-xl bg-[#FFF5F5] active:scale-[0.98] text-[#912018] border border-[#F3D0CE] font-medium text-sm inline-flex items-center justify-center gap-1.5 transition-transform whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B42318]"
          >
            <Minus className="h-4 w-4 shrink-0 text-[#B42318]" strokeWidth={2.2} />
            <span>Registrar gasto</span>
          </button>
        </div>
      </div>

      {/* Hoja modal ligera para registrar un ingreso o gasto */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-[2px] p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-xl">
            <div className="w-10 h-1.5 bg-[#D4DDD8] rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between gap-4">
              <h2
                id="modal-title"
                className="font-display text-lg font-bold text-[#0F1E17]"
              >
                {activeModal === 'ingreso'
                  ? 'Registrar ingreso'
                  : 'Registrar gasto'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Cerrar ventana"
                className="min-h-[44px] min-w-[44px] -mr-2 rounded-xl text-[#56685E] hover:bg-[#F6F8F7] hover:text-[#0F1E17] inline-flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitMovement}
              noValidate
              className="mt-5 flex flex-col gap-4"
            >
              <div>
                <label
                  htmlFor="concepto-input"
                  className="block text-sm font-medium text-[#0F1E17] mb-1.5"
                >
                  {activeModal === 'ingreso'
                    ? 'Concepto del ingreso'
                    : 'Concepto del gasto'}
                </label>
                <input
                  id="concepto-input"
                  type="text"
                  maxLength={60}
                  placeholder={
                    activeModal === 'ingreso'
                      ? 'Ej. Salario, venta, reembolso'
                      : 'Ej. Supermercado, transporte, renta'
                  }
                  value={noteInput}
                  onChange={(e) => {
                    setNoteInput(e.target.value);
                    if (formError) setFormError('');
                  }}
                  autoFocus
                  className={`w-full min-h-[48px] px-4 rounded-xl border border-[#D4DDD8] bg-[#F6F8F7] text-[#0F1E17] text-sm focus:bg-white focus:outline-2 ${
                    activeModal === 'ingreso'
                      ? 'focus:outline-[#0D4A34]'
                      : 'focus:outline-[#B42318]'
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="monto-input"
                  className="block text-sm font-medium text-[#0F1E17] mb-1.5"
                >
                  {activeModal === 'ingreso'
                    ? 'Monto recibido (USD)'
                    : 'Monto (USD)'}
                </label>
                <input
                  id="monto-input"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className={`w-full min-h-[48px] px-4 rounded-xl border border-[#D4DDD8] bg-[#F6F8F7] text-[#0F1E17] text-lg font-semibold tabular-nums focus:bg-white focus:outline-2 ${
                    activeModal === 'ingreso'
                      ? 'focus:outline-[#0D4A34]'
                      : 'focus:outline-[#B42318]'
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="fecha-input"
                  className="block text-sm font-medium text-[#0F1E17] mb-1.5"
                >
                  Fecha
                </label>
                <input
                  id="fecha-input"
                  type="date"
                  value={dateInput}
                  onChange={(e) => {
                    setDateInput(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className={`w-full min-h-[48px] px-4 rounded-xl border border-[#D4DDD8] bg-[#F6F8F7] text-[#0F1E17] text-sm tabular-nums focus:bg-white focus:outline-2 ${
                    activeModal === 'ingreso'
                      ? 'focus:outline-[#0D4A34]'
                      : 'focus:outline-[#B42318]'
                  }`}
                />
              </div>

              {formError && (
                <p role="alert" className="text-sm text-[#B42318]">
                  {formError}
                </p>
              )}

              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="min-h-[48px] px-4 rounded-xl border border-[#D4DDD8] bg-white hover:bg-[#F6F8F7] text-[#0F1E17] font-medium text-sm whitespace-nowrap cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`min-h-[48px] px-4 rounded-xl text-white font-medium text-sm whitespace-nowrap cursor-pointer transition-colors ${
                    activeModal === 'ingreso'
                      ? 'bg-[#0D4A34] hover:bg-[#0A3B29]'
                      : 'bg-[#B42318] hover:bg-[#912018]'
                  }`}
                >
                  {activeModal === 'ingreso' ? 'Guardar ingreso' : 'Guardar gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
