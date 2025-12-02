'use client'
import { assets } from "@/assets/assets"
import NextImage from "next/image"
import { useState } from "react"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useAuth } from "@clerk/nextjs"
import { XIcon } from "lucide-react"

export default function StoreAddProduct() {
    const clothingCategories = [
        "Tops", "Bottoms", "Outerwear", "Dresses", "Footwear", "Accessories"
    ];
    const clothingBrands = [
        "Balenciaga", "Vetements", "Rick Owens", "ERD (Enfants Riches Déprimés)", "Gucci", "Prada", "Acne Studios", "Chrome Hearts", "Other"
    ];
    const conditionOptions = [
        "New with Tags (NWT)",
        "New without Tags (NWOT)",
        "Excellent (Pre-owned)",
        "Very Good (Pre-owned)",
        "Good (Pre-owned)",
        "Distressed / Vintage"
    ];
    const sizeOptions = [
        "XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"
    ];

    const [images, setImages] = useState([])
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
        size: "",
    })
    const [loading, setLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
    const { getToken } = useAuth()

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
            const totalFiles = [...prevImages, ...newFiles]
            let filesToReturn = totalFiles
            if (totalFiles.length > MAX_IMAGES) {
                maxLimitExceeded = true
                filesToReturn = totalFiles.slice(0, MAX_IMAGES)
            }
            filesAdded = filesToReturn.length - prevImages.length
            return filesToReturn
        })

        if (maxLimitExceeded) toast.error(`You can upload a maximum of ${MAX_IMAGES} images.`)
        if (filesAdded > 0 && !maxLimitExceeded) toast.success(`${filesAdded} image(s) added.`)
        setImageProcessing(false)
        e.target.value = null
    }

    const handleRemoveImage = (indexToRemove) => {
        setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove))
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        try {
            if (!productInfo.clothingType || !productInfo.brand || !productInfo.productCondition || !productInfo.size)
                return toast.error('Please complete all category, condition, and size fields.')
            if (images.length < 1)
                return toast.error('Please upload at least one image')
            if (productInfo.mrp === 0)
                return toast.error('Actual Price (MRP) cannot be zero.')
            if (productInfo.price > productInfo.mrp)
                return toast.error('Offer Price cannot be higher than Actual Price (MRP).')

            setLoading(true)
            const token = await getToken()
            const imageUrls = []
            setUploadProgress({ current: 0, total: images.length })

            for (let i = 0; i < images.length; i++) {
                setUploadProgress({ current: i + 1, total: images.length })
                const formData = new FormData()
                formData.append('image', images[i])
                try {
                    const { data } = await axios.post('/api/store/product/upload-image', formData, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    if (data.success && data.url) imageUrls.push(data.url)
                    else throw new Error(`Failed to upload image ${i + 1}`)
                } catch (uploadError) {
                    throw new Error(`Failed to upload image ${i + 1}: ${uploadError?.response?.data?.message || uploadError.message}`)
                }
            }

            const { data } = await axios.post('/api/store/product', {
                name: productInfo.name,
                description: productInfo.description,
                mrp: productInfo.mrp,
                price: productInfo.price,
                category: productInfo.clothingType,
                brand: productInfo.brand,
                condition: productInfo.productCondition,
                size: productInfo.size,
                imageUrls: imageUrls
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            toast.success(data.message)
            setProductInfo({
                name: "",
                description: "",
                mrp: 0,
                price: 0,
                clothingType: "",
                brand: "",
                productCondition: "",
                size: "",
            })
            setImages([])
            setUploadProgress({ current: 0, total: 0 })
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className="max-w-lg mx-auto text-slate-500 mb-20 p-2 sm:p-4">
            <h1 className="text-2xl text-slate-500 mb-2 sm:mb-5">Add New <span className="text-slate-800 font-medium">Product</span></h1>

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
                {images.map((image, index) => (
                    <div key={index} className="relative h-20 w-20 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                        <img
                            className='h-full w-full object-cover'
                            src={URL.createObjectURL(image)}
                            alt={`Product Preview ${index + 1}`}
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 transition leading-none z-10"
                        >
                            <XIcon size={13} />
                        </button>
                    </div>
                ))}
                {images.length < MAX_IMAGES && (
                    <label
                        htmlFor="imageUpload"
                        className="h-20 w-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-slate-500 transition"
                    >
                        <NextImage width={28} height={28} src={assets.upload_area} alt="Upload" />
                        <p className="text-xs mt-1 text-slate-500 font-medium text-center px-1">
                            {images.length > 0 ? `+ Add (${MAX_IMAGES - images.length} left)` : 'Upload'}
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

            <select
                onChange={e => setProductInfo({ ...productInfo, size: e.target.value })}
                value={productInfo.size}
                className="w-full p-2 px-3 mt-3 outline-none border border-slate-200 rounded" required
            >
                <option value="">Select Size</option>
                {sizeOptions.map(size => <option key={size} value={size}>{size}</option>)}
            </select>

            <button disabled={loading}
                className="w-full bg-slate-800 text-white mt-6 py-2 rounded font-semibold text-lg hover:bg-slate-900 transition"
            >
                {loading ? 'Adding...' : 'Add Product'}
            </button>
        </form>
    )
}
