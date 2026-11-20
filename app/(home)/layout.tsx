// Each home page renders its own HomeLayout so the navigation follows the page's language.
export default function Layout({ children }: LayoutProps<'/'>) {
  return children;
}
