'use client'
import { Search, ShoppingCart, PackageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useUser, useClerk, UserButton, useAuth } from '@clerk/nextjs';

const Navbar = () => {
    const { user } = useUser();
    const { openSignIn } = useClerk();
    const { has } = useAuth();
    const router = useRouter();
    const hasPlusPlan = has ? has({ plan: 'plus' }) : false;

    const [search, setSearch] = useState('');
    const cartCount = useSelector(state => state.cart.total);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/shop?search=${search.trim()}`);
        }
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-40 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
            <div className="mx-auto flex items-center justify-between max-w-7xl px-4 py-3">
                
                {/* Logo */}
                <Link href="/" className="relative text-2xl font-semibold text-neutral-800 tracking-tight select-none">
                    <span className="text-green-600">1014</span>gallery<span className="text-green-600 text-3xl align-top">.</span>
                    {hasPlusPlan && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white bg-green-500 align-top">
                            plus
                        </span>
                    )}
                </Link>

                {/* Desktop Nav */}
                <div className="hidden sm:flex items-center gap-7 text-neutral-700 font-light">
                    <Link href="/" className="hover:text-black transition">Home</Link>
                    <Link href="/shop" className="hover:text-black transition">Shop</Link>
                    <Link href="/create-store" className="hover:text-black transition">Sell</Link>

                    <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full shadow-inner w-52 ml-4"
                    >
                        <Search size={18} className="text-gray-500" />
                        <input
                            className="w-full bg-transparent outline-none placeholder-gray-500 text-sm"
                            type="text"
                            placeholder="Search"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </form>

                    <Link href="/cart" className="relative flex items-center gap-1 text-neutral-700 hover:text-black transition">
                        <ShoppingCart size={20}/>
                        <span className="ml-0.5">Cart</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-2 left-3 text-[10px] font-bold text-white bg-black w-4 h-4 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {!user ? (
                        <button
                            onClick={openSignIn}
                            className="ml-3 px-7 py-1.5 bg-black text-white hover:bg-neutral-800 rounded-full text-sm font-medium transition"
                        >
                            Login
                        </button>
                    ) : (
                        <div className="ml-3">
                            <UserButton>
                                <UserButton.MenuItems>
                                    <UserButton.Action
                                        labelIcon={<PackageIcon size={16}/>}
                                        label="My Orders"
                                        onClick={() => router.push('/orders')}
                                    />
                                </UserButton.MenuItems>
                            </UserButton>
                        </div>
                    )}
                </div>

                {/* Mobile Nav */}
                <div className="sm:hidden flex items-center gap-2">
                    <Link href="/cart" className="relative">
                        <ShoppingCart size={22} className="text-neutral-700" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 left-3 text-[10px] font-bold text-white bg-black w-4 h-4 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    {!user ? (
                        <button
                            onClick={openSignIn}
                            className="bg-black text-white px-5 py-1 rounded-full text-sm font-medium"
                        >
                            Login
                        </button>
                    ) : (
                        <UserButton />
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
