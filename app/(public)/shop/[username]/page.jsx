'use client'
import ProductCard from "@/components/ProductCard"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MailIcon } from "lucide-react"
import Loading from "@/components/Loading"
import Image from "next/image"
import axios from "axios"
import toast from "react-hot-toast"

export default function StoreShop() {
    const { username } = useParams()
    const [products, setProducts] = useState([])
    const [storeInfo, setStoreInfo] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchStoreData = async () => {
        try {
            const { data } = await axios.get(`/api/store/data?username=${username}`)
            setStoreInfo(data.store)
            setProducts(data.store.Product)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchStoreData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="min-h-[70vh] bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Store Info Banner */}
                {storeInfo && (
                    <section className="mt-8 sm:mt-10 mb-6">
                        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-6 sm:px-8 sm:py-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                            <Image
                                src={storeInfo.logo}
                                alt={storeInfo.name}
                                className="size-24 sm:size-28 object-cover border border-neutral-200 rounded-xl bg-white"
                                width={160}
                                height={160}
                            />
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">
                                    {storeInfo.name}
                                </h1>
                                {storeInfo.description && (
                                    <p className="mt-3 text-sm text-neutral-600 max-w-xl mx-auto md:mx-0 leading-relaxed">
                                        {storeInfo.description}
                                    </p>
                                )}
                                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-neutral-500 justify-center md:justify-start">
                                    <div className="flex items-center gap-2">
                                        <MailIcon className="w-4 h-4 text-neutral-400" />
                                        <span>{storeInfo.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Products */}
                <section className="mb-32">
                    <div className="flex items-baseline justify-between gap-2 mt-10 mb-4">
                        <h2 className="text-xl sm:text-2xl font-light text-neutral-900">
                            Shop <span className="font-semibold">Products</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-400">
                            {products.length} {products.length === 1 ? 'item' : 'items'}
                        </p>
                    </div>

                    {products.length === 0 ? (
                        <div className="py-16 text-center text-neutral-400 text-sm">
                            No products listed yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
