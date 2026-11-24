import { createMDX } from 'fumadocs-mdx/next';
const withMDX = createMDX();
export default withMDX({
  reactStrictMode:true, basePath:'/docs', output:'standalone', env:{NEXT_PUBLIC_BASE_PATH:'/docs'},
  images: { qualities: [86] },
  async redirects() {
    return [
      { source: '/', destination: '/en', permanent: true },
      ...['commerce', 'money', 'onboarding'].map((slug) => ({
        source: `/:lang(en|ar)/${slug}`,
        destination: `/:lang/workflows/${slug}`,
        permanent: true,
      })),
    ];
  },
});
