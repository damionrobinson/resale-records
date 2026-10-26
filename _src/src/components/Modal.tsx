import { useEffect, useRef, type FormEvent, type ReactNode } from 'react';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  /** Called on submit; return false to keep the dialog open (e.g. on a validation error). */
  onSubmit?: () => boolean | void;
  submitLabel?: string;
  submitDisabled?: boolean;
  cancelLabel?: string;
  children: ReactNode;
}

// Native <dialog> for focus trapping and Esc handling. We drive it from React state and handle
// submit ourselves, because some browsers don't fire the dialog's close event reliably.
export default function Modal({ open, title, onClose, onSubmit, submitLabel, submitDisabled, cancelLabel = 'Cancel', children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (onSubmit && onSubmit() === false) return;
    onClose();
  };

  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onClose(); }} aria-labelledby={`${title}-h`}>
      <form className="dlg" onSubmit={submit}>
        <h2 id={`${title}-h`}>{title}</h2>
        {children}
        <div className="row">
          {submitLabel && <button className="btn" type="submit" disabled={submitDisabled}>{submitLabel}</button>}
          <button className="btn ghost" type="button" onClick={onClose}>{cancelLabel}</button>
        </div>
      </form>
    </dialog>
  );
}
