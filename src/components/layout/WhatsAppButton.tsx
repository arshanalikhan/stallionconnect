import { whatsappUrl } from "@/config/site";

/** Floating WhatsApp chat button, bottom right on every page. */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-soft transition hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" className="size-7 fill-current">
        <path d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.1.56 4.17 1.62 5.98L4 29l8.27-2.15a12.1 12.1 0 0 0 5.77 1.46h.01C24.6 28.31 30 22.95 30 16.34 30 9.73 22.68 3 16.04 3Zm0 22.98h-.01a9.97 9.97 0 0 1-5.08-1.39l-.36-.21-4.91 1.27 1.31-4.77-.24-.38a9.9 9.9 0 0 1-1.53-5.3c0-5.5 4.5-9.97 10.04-9.97 5.53 0 10.82 5.44 10.82 10.11 0 5.5-4.5 10.64-10.04 10.64Zm5.5-7.45c-.3-.15-1.78-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.17-.18.2-.35.22-.65.07-.3-.15-1.27-.46-2.42-1.48-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.48.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z" />
      </svg>
    </a>
  );
}
