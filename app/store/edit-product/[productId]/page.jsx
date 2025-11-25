'use client'
import { assets } from "@/assets/assets"
import NextImage from "next/image"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useAuth, useUser } from "@clerk/nextjs"
import { XIcon } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Loading from "@/components/Loading"

export default function StoreEditProduct() {
    const router = useRouter()
    const params = useParams()
    const productId = params.productId

    const clothingCategories = [
        "Tops", "Bottoms", "Outerwear", "Dresses", "Footwear", "Accessories"
    ]
    const clothingBrands = [
        "Balenciaga", "Vetements", "Rick Owens", "ERD (Enfants Riches Déprimés)", "Gucci", "Prada", "Acne Studios", "Other"
    ]
    const conditionOptions = [
        "New with Tags (NWT)",
        "New without Tags (NWOT)",
        "Excellent (Pre-owned)",
        "Very Good (Pre-owned)",
        "Good (Pre-owned)",
        "Distressed / Vintage"
    ]

    const [images, setImages] = useState([]) // New File objects
    const [existingImages, setExistingImages] = useState([]) // Existing URLs
    const MAX_IMAGES = 10
    const [imageProcessing, setImageProcessing] = useState(false)

    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        clothingType: "",
        brand: "",
        productCondition: "",
    })
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })

    const { getToken } = useAuth()
    const { user } = useUser()

    useEffect(() => {
        if (user && productId) {
            fetchProduct()
        }
    }, [user, productId])

    const fetchProduct = async () => {
        try {
            setFetching(true)
            const token = await getToken()
            const { data } = await axios.get(`/api/store/product?productId=${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.product) {
                const product = data.product
                setProductInfo({
                    name: product.name,
                    description: product.description,
                    mrp: product.mrp,
                    price: product.price,
                    clothingType: product.category,
                    brand: product.brand,
                    productCondition: product.condition,
                })
                setExistingImages(product.images || [])
            } else {
                toast.error('Product not found')
                router.push('/store/manage-product')
            }
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to load product')
            router.push('/store/manage-product')
        } finally {
            setFetching(false)
        }
    }

    const onChangeHandler = (e) => {
        const { name, value } = e.target
        if (name === 'mrp' || name === 'price') {
            const numericValue = value === "" ? 0 : Number(value)
            setProductInfo({ ...productInfo, [name]: numericValue })
        } else {
            setProductInfo({ ...productInfo, [name]: value })
        }
    }

    const handleImageChange = async (e) => {
        const newFiles = Array.from(e.target.files)
        if (newFiles.length === 0) return

        setImageProcessing(true)
        let maxLimitExceeded = false
        let filesAdded = 0

        setImages(prevImages => {
            const totalExisting = existingImages.length
            const totalFiles = [...prevImages, ...newFiles]
            const totalCount = totalExisting + totalFiles.length
            let filesToReturn = totalFiles

            if (totalCount > MAX_IMAGES) {
                maxLimitExceeded = true
                const allowedNew = MAX_IMAGES - totalExisting
                filesToReturn = totalFiles.slice(0, Math.max(0, allowedNew))
            }

            filesAdded = filesToReturn.length - prevImages.length
            return filesToReturn
        })

        if (maxLimitExceeded) {
            toast.error(`You can upload a maximum of ${MAX_IMAGES} images total (including existing).`)
        }

        if (filesAdded > 0 && !maxLimitExceeded) {
            toast.success(`${filesAdded} image(s) added.`)
        }

        setImageProcessing(false)
        e.target.value = null
    }

    const handleRemoveImage = (indexToRemove) => {
        setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove))
    }

    const handleRemoveExistingImage = (indexToRemove) => {
        setExistingImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove))
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        try {
            if (!productInfo.clothingType || !productInfo.brand || !productInfo.productCondition) {
                return toast.error('Please complete all category and condition fields.')
            }

            const totalImageCount = existingImages.length + images.length
            if (totalImageCount < 1) {
                return toast.error('Please keep at least one image')
            }

            if (productInfo.mrp === 0) {
                return toast.error('Actual Price (MRP) cannot be zero.')
            }
            if (productInfo.price > productInfo.mrp) {
                return toast.error('Offer Price cannot be higher than Actual Price (MRP).')
            }

            setLoading(true)
            const token = await getToken()

            // Upload new images sequentially
            const newImageUrls = []
            if (images.length > 0) {
                setUploadProgress({ current: 0, total: images.length })

                for (let i = 0; i < images.length; i++) {
                    setUploadProgress({ current: i + 1, total: images.length })

                    const formData = new FormData()
                    formData.append('image', images[i])

                    try {
                        const { data } = await axios.post('/api/store/product/upload-image', formData, {
                            headers: { Authorization: `Bearer ${token}` }
                        })

                        if (data.success && data.url) {
                            newImageUrls.push(data.url)
                        } else {
                            throw new Error(`Failed to upload image ${i + 1}`)
                        }
                    } catch (uploadError) {
                        throw new Error(`Failed to upload image ${i + 1}: ${uploadError?.response?.data?.message || uploadError.message}`)
                    }
                }
            }

            // Combine existing and new image URLs
            const allImageUrls = [...existingImages, ...newImageUrls]

            // Update the product
            const { data } = await axios.put('/api/store/product', {
                productId,
                name: productInfo.name,
                description: productInfo.description,
                mrp: productInfo.mrp,
                price: productInfo.price,
                category: productInfo.clothingType,
                brand: productInfo.brand,
                condition: productInfo.productCondition,
                imageUrls: allImageUrls
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            toast.success(data.message)
            router.push('/store/manage-product')

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
            setUploadProgress({ current: 0, total: 0 })
        }
    }

    if (fetching) return <Loading />

    return (
        <form onSubmit={onSubmitHandler} className="max-w-lg mx-auto text-slate-500 mb-20 p-2 sm:p-4">
            <h1 className="text-2xl text-slate-500 mb-2 sm:mb-5">Edit <span className="text-slate-800 font-medium">Product</span></h1>

            {/* Upload Progress Indicator */}
            {loading && uploadProgress.total > 0 && (
                <div className="mt-4 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">
                        Uploading images... {uploadProgress.current} of {uploadProgress.total}
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}

            <p className="mt-6 text-base font-semibold">Product Images</p>
            <div className="flex flex-wrap gap-3 mt-3">
                {/* Existing Images */}
                {existingImages.map((imageUrl, index) => (
                    <div key={`existing-${index}`} className="relative h-20 w-20 border-2 border-blue-300 rounded-lg overflow-hidden shadow-sm">
                        <img
                            className='h-full w-full object-cover'
                            src={imageUrl}
                            alt={`Existing ${index + 1}`}
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 transition leading-none z-10"
                        >
                            <XIcon size={13} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 text-center">
                            Existing
                        </div>
                    </div>
                ))}

                {/* New Images */}
                {images.map((image, index) => (
                    <div key={`new-${index}`} className="relative h-20 w-20 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                        <img
                            className='h-full w-full object-cover'
                            src={URL.createObjectURL(image)}
                            alt={`New ${index + 1}`}
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 transition leading-none z-10"
                        >
                            <XIcon size={13} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 text-center">
                            New
                        </div>
                    </div>
                ))}

                {/* Upload Button */}
                {(existingImages.length + images.length) < MAX_IMAGES && (
                    <label
                        htmlFor="imageUpload"
                        className="h-20 w-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-slate-500 transition"
                    >
                        <NextImage width={28} height={28} src={assets.upload_area} alt="Upload" />
                        <p className="text-xs mt-1 text-slate-500 font-medium text-center px-1">
                            {existingImages.length + images.length > 0 ? `+ Add (${MAX_IMAGES - (existingImages.length + images.length)} left)` : 'Upload'}
                        </p>
                        <input
                            type="file"
                            accept='image/*'
                            id="imageUpload"
                            onChange={handleImageChange}
                            multiple
                            disabled={imageProcessing || loading}
                            hidden
                        />
                    </label>
                )}
            </div>

            <label className="flex flex-col gap-1 my-5">
                Name
                <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Enter product name"
                    className="w-full p-2 px-3 outline-none border border-slate-200 rounded" required />
            </label>

            <label className="flex flex-col gap-1 my-5">
                Description
                <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Describe product"
                    rows={4}
                    className="w-full p-2 px-3 outline-none border border-slate-200 rounded resize-none" required />
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex flex-col gap-1 w-full sm:w-1/2">
                    Actual Price ($) (MRP)
                    <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp || ''} min="0"
                        className="w-full p-2 px-3 outline-none border border-slate-200 rounded" required />
                </label>
                <label className="flex flex-col gap-1 w-full sm:w-1/2">
                    Offer Price ($)
                    <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price || ''} min="0"
                        className="w-full p-2 px-3 outline-none border border-slate-200 rounded" required />
                </label>
            </div>

            <select
                onChange={e => setProductInfo({ ...productInfo, clothingType: e.target.value })}
                value={productInfo.clothingType}
                className="w-full p-2 px-3 mt-5 outline-none border border-slate-200 rounded" required
            >
                <option value="">Select Type (Category)</option>
                {clothingCategories.map(type => <option key={type} value={type}>{type}</option>)}
            </select>

            <select
                onChange={e => setProductInfo({ ...productInfo, brand: e.target.value })}
                value={productInfo.brand}
                className="w-full p-2 px-3 mt-3 outline-none border border-slate-200 rounded" required
            >
                <option value="">Select Brand</option>
                {clothingBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
            </select>

            <select
                onChange={e => setProductInfo({ ...productInfo, productCondition: e.target.value })}
                value={productInfo.productCondition}
                className="w-full p-2 px-3 mt-3 outline-none border border-slate-200 rounded" required
            >
                <option value="">Select Condition</option>
                {conditionOptions.map(condition => <option key={condition} value={condition}>{condition}</option>)}
            </select>

            <div className="flex gap-3 mt-6">
                <button
                    type="button"
                    onClick={() => router.push('/store/manage-product')}
                    disabled={loading}
                    className="flex-1 bg-slate-200 text-slate-700 py-2 rounded font-semibold hover:bg-slate-300 transition disabled:opacity-50"
                >
                    Cancel
                </button>
                <button disabled={loading}
                    className="flex-1 bg-slate-800 text-white py-2 rounded font-semibold text-lg hover:bg-slate-900 transition disabled:opacity-50"
                >
                    {loading ? 'Updating...' : 'Update Product'}
                </button>
            </div>
        </form>
    )
}

