'use client'
import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Counter = ({ productId, product }) => {
    const { cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);
    const dispatch = useDispatch();
    const { userId } = useAuth();
    const router = useRouter();

    // Get product info if not passed as prop
    const productInfo = product || products.find(p => p.id === productId);
    const isSold = productInfo?.sold || false;

    const addToCartHandler = () => {
        // Check if user is logged in
        if (!userId) {
            toast.error('Please log in to add items to cart')
            router.push('/login')
            return
        }

        // Prevent adding sold items
        if (isSold) {
            return
        }
        dispatch(addToCart({ productId, product: productInfo }))
    }

    const removeFromCartHandler = () => {
        dispatch(removeFromCart({ productId }))
    }

    return (
        <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600">
            <button 
                onClick={removeFromCartHandler} 
                className="p-1 select-none hover:bg-slate-100 rounded transition"
            >
                -
            </button>
            <p className="p-1">{cartItems[productId]}</p>
            <button 
                onClick={addToCartHandler} 
                disabled={isSold}
                className={`p-1 select-none hover:bg-slate-100 rounded transition ${
                    isSold ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                +
            </button>
        </div>
    )
}

export default Counter