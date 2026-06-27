/** @type {import('next').NextConfig} */
import { securityHeaderRoute } from './lib/securityHeaders.js';

const nextConfig = {
    images:{
        unoptimized: true
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '1mb'
        },
    },
    async headers() {
        return [securityHeaderRoute];
    },
};

export default nextConfig;