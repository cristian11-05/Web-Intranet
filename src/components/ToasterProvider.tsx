import { Toaster } from 'sonner';

export const ToasterProvider = () => {
    return (
        <Toaster
            position="top-right"
            expand={true}
            richColors
            closeButton
            toastOptions={{
                style: {
                    background: '#FFFFFF',
                    color: '#141C26',
                    border: '1px solid #E2E8F0',
                    borderRadius: '1.25rem',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                },
                className: 'font-sans',
            }}
        />
    );
};
