'use client'
import { assets } from "@/assets/assets"
import NextImage from "next/image" // FIXED: Renamed to NextImage to avoid native Image constructor conflict
import { useState } from "react"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useAuth } from "@clerk/nextjs"
import { XIcon } from "lucide-react" 

export default function StoreAddProduct() {

    // Define clothing categories (Types)
    const clothingCategories = [
        "Tops", "Bottoms", "Outerwear", "Dresses", "Footwear", "Accessories"
    ];

    // Define brands
    const clothingBrands = [
        "Balenciaga", "Vetements", "Rick Owens", "ERD (Enfants Riches Déprimés)", "Gucci", "Prada", "Acne Studios", "Other"
    ];

    // --- Define Condition Options ---
    const conditionOptions = [
        "New with Tags (NWT)", 
        "New without Tags (NWOT)", 
        "Excellent (Pre-owned)", 
        "Very Good (Pre-owned)", 
        "Good (Pre-owned)",
        "Distressed / Vintage"
    ];
    // -------------------------------------

    const [images, setImages] = useState([])
    const MAX_IMAGES = 10; // Set maximum limit for photos
    const [imageProcessing, setImageProcessing] = useState(false) // State kept, though compression logic is removed

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
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })

    const {getToken} = useAuth()


    // --- ROBUSTNESS: Handle input changes, safely converting numbers ---
    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        
        if (name === 'mrp' || name === 'price') {
            // Safely convert to number, defaulting to 0 if empty or invalid
            const numericValue = value === "" ? 0 : Number(value);
            setProductInfo({ ...productInfo, [name]: numericValue });
        } else {
            setProductInfo({ ...productInfo, [name]: value });
        }
    }
    // -------------------------------------------------------------------
    
    // --- Image Compression Helper ---
    // NOTE: This function is completely removed as per your request to rely on server-side optimization
    // -------------------------------------------------------------------

    // --- Image Handlers ---
    const handleImageChange = async (e) => {
        const newFiles = Array.from(e.target.files);

        if (newFiles.length === 0) return;

        setImageProcessing(true);

        // Track the result of the state update
        let maxLimitExceeded = false;
        let filesAdded = 0; 

        setImages(prevImages => {
            const totalFiles = [...prevImages, ...newFiles];
            let filesToReturn = totalFiles;

            if (totalFiles.length > MAX_IMAGES) {
                // 1. Set the flag to true instead of calling toast.error
                maxLimitExceeded = true;
                filesToReturn = totalFiles.slice(0, MAX_IMAGES);
            }
            
            // Calculate how many were successfully added/kept
            filesAdded = filesToReturn.length - prevImages.length; 

            return filesToReturn;
        });

        // 2. Run both side effects (toasts) outside the state setter

        if (maxLimitExceeded) {
            toast.error(`You can upload a maximum of ${MAX_IMAGES} images.`);
        }

        if (filesAdded > 0 && !maxLimitExceeded) {
            // Only show success if files were added AND we didn't show the max limit error.
            // We can simplify this: if files were added, show success. The error will handle the other case.
            toast.success(`${filesAdded} image(s) added.`);
        }

        setImageProcessing(false);
        e.target.value = null;
    };

    const handleRemoveImage = (indexToRemove) => {
        setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
    };
    // ----------------------


    const onSubmitHandler = async (e) => {
        e.preventDefault();

        try {
          // Check for required fields
          if (!productInfo.clothingType || !productInfo.brand || !productInfo.productCondition) {
            return toast.error('Please complete all category and condition fields.');
          }

          if (images.length < 1) {
            return toast.error('Please upload at least one image');
          }

          // --- ROBUSTNESS: Price Validation Check ---
          if (productInfo.mrp === 0) {
            return toast.error('Actual Price (MRP) cannot be zero.');
          }
          if (productInfo.price > productInfo.mrp) {
            return toast.error('Offer Price cannot be higher than Actual Price (MRP).');
          }
          // ------------------------------------------

          setLoading(true);
          const token = await getToken();

          // Upload images sequentially (one at a time)
          const imageUrls = [];
          setUploadProgress({ current: 0, total: images.length });

          for (let i = 0; i < images.length; i++) {
            setUploadProgress({ current: i + 1, total: images.length });

            const formData = new FormData();
            formData.append('image', images[i]);

            try {
              const { data } = await axios.post('/api/store/product/upload-image', formData, {
                headers: { Authorization: `Bearer ${token}` }
              });

              if (data.success && data.url) {
                imageUrls.push(data.url);
              } else {
                throw new Error(`Failed to upload image ${i + 1}`);
              }
            } catch (uploadError) {
              console.error(`Error uploading image ${i + 1}:`, uploadError);
              throw new Error(`Failed to upload image ${i + 1}: ${uploadError?.response?.data?.message || uploadError.message}`);
            }
          }

          // All images uploaded successfully, now create the product
          const { data } = await axios.post('/api/store/product', {
            name: productInfo.name,
            description: productInfo.description,
            mrp: productInfo.mrp,
            price: productInfo.price,
            category: productInfo.clothingType,
            brand: productInfo.brand,
            condition: productInfo.productCondition,
            imageUrls: imageUrls
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          toast.success(data.message);

          // reset form
          setProductInfo({
            name: "",
            description: "",
            mrp: 0,
            price: 0,
            clothingType: "",
            brand: "",
            productCondition: "",
          })
          setImages([]);
          setUploadProgress({ current: 0, total: 0 });
        } catch (error) {
          toast.error(error?.response?.data?.error || error.message);
        } finally {
          setLoading(false);
        }
    }


    return (
        <form onSubmit={onSubmitHandler} className="text-slate-500 mb-28 p-4 md:p-0">
            <h1 className="text-2xl text-slate-500">Add New <span className="text-slate-800 font-medium">Products</span></h1>

            {/* Upload Progress Indicator */}
            {loading && uploadProgress.total > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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

            <p className="mt-7">Product Images</p>

            {/* --- IMAGE UPLOAD UI --- */}
            <div className="flex flex-wrap gap-4 mt-4">
                
                {/* 1. Dynamic Image Previews */}
                {images.map((image, index) => (
                    // Made container h-24 w-24 for better mobile fit
                    <div key={index} className="relative h-24 w-24 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                        <img 
                            className='h-full w-full object-cover' 
                            src={URL.createObjectURL(image)} 
                            alt={`Product Preview ${index + 1}`} 
                        />
                        {/* Remove Button */}
                        <button 
                            type="button" 
                            onClick={() => handleRemoveImage(index)} 
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 transition leading-none z-10"
                        >
                            <XIcon size={14} />
                        </button>
                    </div>
                ))}

                {/* 2. Primary Upload Input */}
                {images.length < MAX_IMAGES && (
                    // Made container h-24 w-24 for better mobile fit
                    <label 
                        htmlFor="imageUpload" 
                        className="h-24 w-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-slate-500 transition"
                    >
                        {/* FIXED: Using NextImage component */}
                        <NextImage width={30} height={30} src={assets.upload_area} alt="Upload" /> 
                        <p className="text-xs mt-1 text-slate-500 text-center font-medium px-1">
                            {images.length > 0 ? `+ Add More (${MAX_IMAGES - images.length} left)` : 'Upload Photos'}
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
            {/* ----------------------------------- */}

            <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                Name
                {/* Mobile: w-full, Desktop: max-w-sm */}
                <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Enter product name" className="w-full sm:max-w-sm p-2 px-4 outline-none border border-slate-200 rounded" required />
            </label>

            <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                Description
                {/* Mobile: w-full, Desktop: max-w-sm */}
                <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Enter product description" rows={5} className="w-full sm:max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
            </label>

            {/* --- MOBILE OPTIMIZATION: Price/MRP fields stack vertically on mobile (flex-col) --- */}
            <div className="flex flex-col sm:flex-row gap-5">
                <label htmlFor="" className="flex flex-col gap-2 w-full sm:w-auto">
                    Actual Price ($) (MRP)
                    <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp || ''} placeholder="0" rows={5} className="w-full sm:max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                </label>
                <label htmlFor="" className="flex flex-col gap-2 w-full sm:w-auto">
                    Offer Price ($)
                    <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price || ''} placeholder="0" rows={5} className="w-full sm:max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                </label>
            </div>
            {/* ---------------------------------------------------------------------------------- */}
            
            {/* Select for Clothing Type */}
            <select 
                onChange={e => setProductInfo({ ...productInfo, clothingType: e.target.value })} 
                value={productInfo.clothingType} 
                className="w-full sm:max-w-sm p-2 px-4 mt-6 outline-none border border-slate-200 rounded" required
            >
                <option value="">Select Clothing Type (Category)</option>
                {clothingCategories.map((type) => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
            
            {/* Select for Brand */}
            <select 
                onChange={e => setProductInfo({ ...productInfo, brand: e.target.value })} 
                value={productInfo.brand} 
                className="w-full sm:max-w-sm p-2 px-4 my-6 outline-none border border-slate-200 rounded" required
            >
                <option value="">Select Brand</option>
                {clothingBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                ))}
            </select>

            {/* Select for Condition */}
            <select 
                onChange={e => setProductInfo({ ...productInfo, productCondition: e.target.value })} 
                value={productInfo.productCondition} 
                className="w-full sm:max-w-sm p-2 px-4 mb-6 outline-none border border-slate-200 rounded" required
            >
                <option value="">Select Product Condition</option>
                {conditionOptions.map((condition) => (
                    <option key={condition} value={condition}>{condition}</option>
                ))}
            </select>

            <br />

            <button disabled={loading} className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition">
                {loading ? 'Adding...' : 'Add Product'}
            </button>
        </form>
    )
}