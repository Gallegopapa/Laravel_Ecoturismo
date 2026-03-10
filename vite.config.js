import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    server: {
        host: '127.0.0.1',
        port: 5173,
        hmr: {
            host: '127.0.0.1',
        },
        proxy: {
            '/api': 'http://localhost:8000',
            '/storage': 'http://localhost:8000',
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        react({
            include: '**/*.{jsx,js}',
        }),
        tailwindcss(),
    ],
    esbuild: {
        loader: 'jsx',
        include: /resources\/js\/.*\.jsx?$/,
        exclude: [],
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react-dom')) return 'vendor-react-dom';
                        if (id.includes('react-router')) return 'vendor-router';
                        if (id.includes('react')) return 'vendor-react';
                        return 'vendor';
                    }
                },
            },
        },
        chunkSizeWarningLimit: 500,
    },
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
});
