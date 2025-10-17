import Link from 'next/link';

// navi
const navItems = [
  {
    label: 'Projects',
    href: '/dashboard',
  },
  {
    label: 'My Page',
    href: '/mypage',
  },
];

const Header = () => (
  <header className="p-2 shadow-md z-10 flex justify-between items-center border-b border-gray-800">
    <h1 className="text-l text-gray-100">
      <Link href="/">My Develops</Link>
    </h1>

    <nav className="flex items-center gap-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm text-gray-400 hover:text-gray-100 transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  </header>
);

export { Header };
