import { createMDX } from 'fumadocs-mdx/next';
const withMDX = createMDX();
export default withMDX({
  reactStrictMode:true, basePath:'/docs', output:'standalone', env:{NEXT_PUBLIC_BASE_PATH:'/docs'},
  async redirects() {
    return [
      // The English home lives at the root; the Arabic home is app/(home)/ar.
      { source: '/en', destination: '/', permanent: false },
      ...['commerce', 'money', 'onboarding'].map((slug) => ({
        source: `/:lang(en|ar)/${slug}`,
        destination: `/:lang/workflows/${slug}`,
        permanent: false,
      })),
    ];
  },
});
